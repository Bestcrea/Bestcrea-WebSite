import { prisma } from "@/lib/prisma";
import { pickLocale, pickLocaleList } from "@/lib/i18n-content";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

const LOCALE_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  ar: "Arabic",
  es: "Spanish",
  de: "German",
};

export async function buildSystemPrompt(locale: string) {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const serviceLines = services
    .map((service) => {
      const title = pickLocale(service.title as never, locale);
      const excerpt = pickLocale(service.excerpt as never, locale);
      return `- ${title}: ${excerpt}`;
    })
    .join("\n");

  const plans = await prisma.pricingPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const planLines = plans
    .map((plan) => {
      const name = pickLocale(plan.name as never, locale);
      const features = pickLocaleList(plan.features, locale).slice(0, 8).join("; ");
      return `- ${name}: ${Number(plan.price)} ${plan.currency}${plan.originalPrice ? ` (instead of ${Number(plan.originalPrice)})` : ""} — ${features}`;
    })
    .join("\n");

  const language = LOCALE_NAMES[locale] || "French";

  return `You are the Bestcrea digital agency assistant embedded on bestcrea.com.
Bestcrea is a premium digital agency (Khemisset, Morocco) offering web, mobile, SaaS, WordPress, migration, AI & automation, UI/UX, SEO, hosting & domains.

Services:
${serviceLines || "- Web Development, Mobile Apps, SaaS, WordPress, Migration, AI & Automation, UI/UX, SEO, Hosting & Domain"}

Fixed-price packs (prices are real and current — you may quote them, always "HT"):
${planLines || "- See the pricing page"}

Guidelines:
- Always reply in ${language} (locale code: ${locale}).
- Be concise, professional, and helpful. Use short paragraphs; no markdown headings.
- You can answer ANY question (web, marketing, technology, general knowledge) accurately and politely. When it is relevant, connect the answer back to how Bestcrea can help; never push services on unrelated questions.
- When the visitor is choosing between packs, compare them using the list above and recommend one. The checkout link is /checkout?plan=<slug> and the quote form is /ressources/devis.
- If you are not sure about a fact, say so instead of guessing. Never invent discounts, delivery times or guarantees that are not listed here.
- After your answer, add ONE final line exactly in this form: SUGGESTIONS: question 1 | question 2 | question 3 (three short follow-up questions the visitor might ask next, in ${language}, max 8 words each).
- Explain how Bestcrea can help and suggest relevant services.
- If the user shares name/email/phone or asks to be contacted, acknowledge and confirm a sales lead will be created.
- Ask for missing contact details gently when the user wants a quote or a call-back.
- Never invent pricing guarantees; suggest requesting a quote.
- Contact: +212 636 499 140 · contact@bestcrea.com · Khemisset, Morocco.`;
}

export function extractContactFromText(text: string): {
  email?: string;
  phone?: string;
  name?: string;
} {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+|00)?[\d][\d\s().-]{7,}\d/);
  const nameMatch = text.match(
    /(?:je m'appelle|my name is|me llamo|ich heiße|اسمي)\s+([A-Za-zÀ-ÿ' -]{2,60})/i
  );

  return {
    email: emailMatch?.[0]?.toLowerCase(),
    phone: phoneMatch?.[0]?.replace(/\s+/g, " ").trim(),
    name: nameMatch?.[1]?.trim(),
  };
}

async function callOpenAI(messages: ChatMessage[], system: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`OpenAI error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function callGemini(messages: ChatMessage[], system: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || null;
}

/** Split the trailing "SUGGESTIONS: a | b | c" line off the model's answer. */
export function splitSuggestions(raw: string): { reply: string; suggestions: string[] } {
  const match = raw.match(/\n?\s*SUGGESTIONS?\s*:\s*([\s\S]+)$/i);
  if (!match) return { reply: raw.trim(), suggestions: [] };
  const suggestions = match[1]
    .split("|")
    .map((x) => x.replace(/^[-•\d.)\s]+/, "").trim())
    .filter((x) => x.length > 2 && x.length < 90)
    .slice(0, 3);
  return { reply: raw.slice(0, match.index).trim(), suggestions };
}

const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  fr: ["Quel pack choisir pour mon activité ?", "Combien coûte un site web ?", "Comment demander un devis ?"],
  en: ["Which pack should I choose?", "How much does a website cost?", "How do I request a quote?"],
  ar: ["أي باقة أختار لنشاطي؟", "كم تكلفة إنشاء موقع؟", "كيف أطلب عرض سعر؟"],
  es: ["¿Qué pack elegir para mi negocio?", "¿Cuánto cuesta un sitio web?", "¿Cómo pido un presupuesto?"],
  de: ["Welches Paket passt zu mir?", "Was kostet eine Website?", "Wie frage ich ein Angebot an?"],
};

export async function generateAssistantReply(
  messages: ChatMessage[],
  locale: string
): Promise<{ reply: string; suggestions: string[]; provider: "openai" | "gemini" | "fallback" }> {
  const system = await buildSystemPrompt(locale);
  const errors: string[] = [];

  if (process.env.OPENAI_API_KEY) {
    try {
      const raw = await callOpenAI(messages, system);
      if (raw) return { ...splitSuggestions(raw), provider: "openai" };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "openai_failed");
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const raw = await callGemini(messages, system);
      if (raw) return { ...splitSuggestions(raw), provider: "gemini" };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "gemini_failed");
    }
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  return {
    provider: "fallback",
    reply: buildFallbackReply(locale, lastUser),
    suggestions: FALLBACK_SUGGESTIONS[locale] ?? FALLBACK_SUGGESTIONS.fr,
  };
}

function buildFallbackReply(locale: string, lastUser: string) {
  const templates: Record<string, string> = {
    fr: `Merci pour votre message. Bestcrea peut vous accompagner sur le web, le mobile, le SaaS, WordPress, la migration, l'IA & automatisation, l'UI/UX, le SEO et l'hébergement.\n\nPour un devis personnalisé, laissez votre nom et email (ou contactez +212 636 499 140). Un conseiller vous répondra rapidement.\n\n(Réponse locale — l'API IA est temporairement indisponible.)`,
    en: `Thanks for your message. Bestcrea can help with web, mobile, SaaS, WordPress, migration, AI & automation, UI/UX, SEO and hosting.\n\nFor a tailored quote, share your name and email (or call +212 636 499 140). A specialist will follow up soon.\n\n(Local fallback — the AI API is temporarily unavailable.)`,
    ar: `شكراً لرسالتك. تقدّم Bestcrea خدمات الويب والموبايل وSaaS وWordPress والترحيل والذكاء الاصطناعي والأتمتة وUI/UX وSEO والاستضافة.\n\nلطلب عرض سعر، اترك اسمك وبريدك أو اتصل على +212 636 499 140.\n\n(رد احتياطي محلي — واجهة الذكاء الاصطناعي غير متاحة مؤقتاً.)`,
    es: `Gracias por tu mensaje. Bestcrea puede ayudarte con web, móvil, SaaS, WordPress, migración, IA y automatización, UI/UX, SEO y hosting.\n\nPara un presupuesto, deja tu nombre y email (o llama al +212 636 499 140).\n\n(Respuesta local — la API de IA no está disponible temporalmente.)`,
    de: `Danke für Ihre Nachricht. Bestcrea unterstützt Sie bei Web, Mobile, SaaS, WordPress, Migration, KI & Automation, UI/UX, SEO und Hosting.\n\nFür ein Angebot hinterlassen Sie Name und E-Mail (oder rufen Sie +212 636 499 140 an).\n\n(Lokale Fallback-Antwort — die KI-API ist vorübergehend nicht verfügbar.)`,
  };

  const base = templates[locale] || templates.fr;
  if (!lastUser) return base;
  return base;
}
