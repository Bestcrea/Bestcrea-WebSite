import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractContactFromText,
  generateAssistantReply,
  type ChatMessage,
} from "@/lib/chat";
import { notifyNewLead } from "@/lib/mailer";
import { notifyStaff } from "@/lib/notify";
import { clientKey, rateLimit } from "@/lib/rate-limit";

type ChatBody = {
  conversationId?: string;
  message?: string;
  locale?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  /** Visitor asked to talk to a human advisor. */
  handoff?: boolean;
};

type StoredMessage = ChatMessage & { createdAt: string };

function asMessages(value: unknown): StoredMessage[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is StoredMessage =>
      !!item &&
      typeof item === "object" &&
      ("role" in item) &&
      ("content" in item)
  ) as StoredMessage[];
}

export async function POST(request: NextRequest) {
  try {
    // Public endpoint that costs money per call: throttle per IP.
    const limited = rateLimit(clientKey(request, "chat"), 30, 10 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Too many messages. Please wait a moment." }, { status: 429 });
    }

    const body = (await request.json()) as ChatBody;
    const message = body.message?.trim();
    const locale = body.locale?.trim() || "fr";

    if (message && message.length > 2000) {
      return NextResponse.json({ error: "message too long" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    let conversation = body.conversationId
      ? await prisma.chatConversation.findUnique({ where: { id: body.conversationId } })
      : null;

    const extracted = extractContactFromText(message);
    const guestEmail =
      body.guestEmail?.trim().toLowerCase() ||
      extracted.email ||
      conversation?.guestEmail ||
      null;
    const guestName =
      body.guestName?.trim() ||
      extracted.name ||
      conversation?.guestName ||
      null;
    const guestPhone = body.guestPhone?.trim() || extracted.phone || null;

    const now = new Date().toISOString();
    const previous = asMessages(conversation?.messages);
    const userMessage: StoredMessage = {
      role: "user",
      content: message,
      createdAt: now,
    };
    const historyForModel: ChatMessage[] = [...previous, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const { reply, provider, suggestions } = await generateAssistantReply(historyForModel.slice(-20), locale);
    const assistantMessage: StoredMessage = {
      role: "assistant",
      content: reply,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...previous, userMessage, assistantMessage];

    const metadata = {
      provider,
      lastContact: {
        email: guestEmail,
        name: guestName,
        phone: guestPhone,
      },
    };

    if (conversation) {
      conversation = await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: {
          messages: nextMessages,
          locale,
          guestEmail,
          guestName,
          metadata,
          status: body.handoff ? "handoff" : conversation.status === "handoff" ? "handoff" : "open",
          subject: conversation.subject || message.slice(0, 80),
          messageCount: nextMessages.length,
          lastActivityAt: new Date(),
          ...(body.handoff && !conversation.handoffToHuman ? { handoffToHuman: true, handoffAt: new Date() } : {}),
        },
      });
    } else {
      conversation = await prisma.chatConversation.create({
        data: {
          subject: message.slice(0, 80),
          locale,
          status: body.handoff ? "handoff" : "open",
          messages: nextMessages,
          guestEmail,
          guestName,
          metadata,
          messageCount: nextMessages.length,
          lastActivityAt: new Date(),
          ...(body.handoff ? { handoffToHuman: true, handoffAt: new Date() } : {}),
        },
      });
    }

    if (body.handoff) {
      await notifyStaff({
        type: "chat.handoff",
        title: "Un visiteur demande un conseiller",
        body: guestName || guestEmail || message.slice(0, 80),
        href: "/admin/ai-agent",
      });
    }

    let leadId: string | null = null;
    if (guestEmail && guestName) {
      const existingMeta = (conversation.metadata || {}) as Record<string, unknown>;
      if (!existingMeta.leadId) {
        const lead = await prisma.lead.create({
          data: {
            name: guestName,
            email: guestEmail,
            phone: guestPhone,
            message: `Lead via chatbot:\n${message}`,
            source: "chat",
            locale,
            status: "new",
            metadata: { conversationId: conversation.id },
          },
        });
        leadId = lead.id;
        await prisma.chatConversation.update({
          where: { id: conversation.id },
          data: {
            metadata: {
              ...metadata,
              leadId,
            },
          },
        });
        await notifyNewLead({
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          message,
          source: "chat",
          locale,
        }).catch(() => null);
      } else {
        leadId = String(existingMeta.leadId);
      }
    }

    return NextResponse.json({
      ok: true,
      conversationId: conversation.id,
      reply,
      suggestions,
      provider,
      leadId,
      messages: nextMessages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    console.error("[api/chat]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
