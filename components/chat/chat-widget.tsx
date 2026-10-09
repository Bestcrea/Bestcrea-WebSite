"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Headset,
  MessageCircle,
  ChevronDown,
  ThumbsDown,
  ThumbsUp,
  SquarePen,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { OPEN_CHAT_EVENT } from "@/lib/chat-events";
import { cn } from "@/lib/utils";

type Plan = { slug: string; name: string; price: number; originalPrice: number | null; currency: string; features: string[]; discountAmount: number | null };
type UiMessage = { role: "user" | "assistant"; content: string; time: string };
const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
type Mode = "welcome" | "guide" | "reco" | "chat";

const STORAGE_KEY = "bestcrea_chat_conversation_id";
const WHATSAPP_URL = "https://wa.me/message/AHNK3DLMPNHQO1";
const BUDGET_MAX = [3000, 6000, 10000, Infinity];

export function ChatWidget() {
  const t = useTranslations("Chat");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("welcome");
  const [step, setStep] = useState(0);
  const [needIdx, setNeedIdx] = useState<number | null>(null);
  const [budgetIdx, setBudgetIdx] = useState<number | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setConversationId(saved);
  }, []);

  useEffect(() => {
    function onOpenChat() {
      setOpen(true);
    }
    window.addEventListener(OPEN_CHAT_EVENT, onOpenChat);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpenChat);
  }, []);

  useEffect(() => {
    if (!open || plans.length) return;
    fetch(`/api/chat/plans?locale=${locale}`)
      .then((r) => (r.ok ? r.json() : { plans: [] }))
      .then((d: { plans?: Plan[] }) => setPlans(d.plans ?? []))
      .catch(() => null);
  }, [open, locale, plans.length]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, mode, step, open]);

  const explore = [t("s1"), t("s2"), t("s3"), t("s4")];
  const needs = [t("o1"), t("o2"), t("o3"), t("o4")];
  const budgets = [t("b1"), t("b2"), t("b3"), t("b4")];

  function reset() {
    setMode("welcome");
    setStep(0);
    setNeedIdx(null);
    setBudgetIdx(null);
    setMessages([]);
    setSuggestions([]);
    setHandoff(false);
    setConversationId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function recommendedPlan(): Plan | null {
    if (needIdx === null || budgetIdx === null || needIdx > 2 || !plans.length) return null;
    const max = BUDGET_MAX[budgetIdx];
    let affordable = -1;
    plans.forEach((p, i) => {
      if (p.price <= max) affordable = i;
    });
    const idx = Math.max(0, Math.min(needIdx, affordable < 0 ? 0 : affordable, plans.length - 1));
    return plans[idx];
  }

  async function send(text: string, opts?: { handoff?: boolean }) {
    const value = text.trim();
    if (!value || loading) return;
    setMode("chat");
    setLoading(true);
    setSuggestions([]);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: value, time: nowTime() }]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: value, locale, handoff: opts?.handoff }),
      });
      const data = (await response.json()) as {
        reply?: string;
        suggestions?: string[];
        conversationId?: string;
        error?: string;
      };
      if (!response.ok || !data.reply) throw new Error(data.error || t("error"));
      if (data.conversationId) {
        setConversationId(data.conversationId);
        window.localStorage.setItem(STORAGE_KEY, data.conversationId);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply!, time: nowTime() }]);
      setSuggestions(data.suggestions ?? []);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("error"), time: nowTime() }]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  async function talkToHuman() {
    setHandoff(true);
    await send(t("human"), { handoff: true });
  }

  const reco = mode === "reco" ? recommendedPlan() : null;
  const others = plans.filter((p) => p.slug !== reco?.slug);
  const fmt = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 0 });

  const optionBtn =
    "flex w-full items-center gap-3 rounded-xl border border-primary/15 bg-white px-4 py-3 text-start text-sm text-primary transition hover:border-accent hover:bg-accent/5";

  return (
    <div className="pointer-events-none fixed bottom-5 end-5 z-[60] flex flex-col items-end gap-3">
      {open ? (
        <div className="pointer-events-auto flex h-[min(820px,calc(100vh-7rem))] w-[min(640px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-2xl shadow-primary/25">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-primary/10 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight text-primary">{t("agentTitle")}</p>
                <p className="text-[11px] text-primary/55">{t("agentSubtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary/60">
              <button type="button" onClick={reset} aria-label={t("newChat")} title={t("newChat")} className="rounded-lg p-1.5 hover:bg-primary/5">
                <SquarePen className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label={t("minimize")} title={t("minimize")} className="rounded-lg p-1.5 hover:bg-primary/5">
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto bg-white p-5">
            {mode === "welcome" ? (
              <div>
                <h3 className="text-xl font-semibold text-primary">{t("welcomeTitle")}</h3>
                <p className="mt-1 text-sm text-primary/65">{t("welcome")}</p>

                <button
                  type="button"
                  onClick={() => {
                    setMode("guide");
                    setStep(0);
                  }}
                  className="group mt-5 w-full rounded-2xl bg-gradient-to-br from-accent to-[#9B5CFF] p-5 text-start text-white shadow-lg shadow-accent/30 transition hover:-translate-y-0.5"
                >
                  <p className="flex items-center justify-between text-base font-semibold">
                    {t("guideTitle")}
                    <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </p>
                  <p className="mt-1 text-sm text-white/85">{t("guideText")}</p>
                </button>

                <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-primary/50">{t("explore")}</p>
                <div className="space-y-2">
                  {explore.map((q) => (
                    <button key={q} type="button" onClick={() => void send(q)} className={cn(optionBtn, "justify-between")}>
                      <span>{q}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-primary/40 rtl:rotate-180" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {mode === "guide" ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} />
                  </div>
                  <span className="text-xs text-primary/55">
                    {t("question")} {step + 1}/2
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-primary">{step === 0 ? t("q1") : t("q2")}</h3>
                <div className="mt-4 space-y-2">
                  {(step === 0 ? needs : budgets).map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        if (step === 0) {
                          setNeedIdx(i);
                          if (i === 3) {
                            setBudgetIdx(3);
                            setMode("reco");
                          } else setStep(1);
                        } else {
                          setBudgetIdx(i);
                          setMode("reco");
                        }
                      }}
                      className={optionBtn}
                    >
                      <span className="flex h-4 w-4 shrink-0 rounded-full border-2 border-primary/30" />
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => (step === 0 ? setStep(1) : (setBudgetIdx(3), setMode("reco")))}
                  className="mt-4 text-sm font-medium text-accent hover:underline"
                >
                  {t("skip")}
                </button>
              </div>
            ) : null}

            {mode === "reco" ? (
              <div className="space-y-4">
                <div className="space-y-1 rounded-2xl bg-white p-4 text-sm shadow-sm">
                  <p className="flex items-center gap-2 font-semibold text-primary">
                    <Check className="h-4 w-4 text-emerald-600" /> {t("allSet")}
                  </p>
                  {needIdx !== null ? <p className="text-primary/65">{needs[needIdx]}</p> : null}
                  {budgetIdx !== null && needIdx !== 3 ? <p className="text-primary/65">{budgets[budgetIdx]}</p> : null}
                </div>

                <p className="text-sm text-primary/75">{reco ? t("recoIntro") : t("recoCustomIntro")}</p>

                {reco ? (
                  <div className="rounded-3xl bg-[#7B61FF] p-6 text-white shadow-lg shadow-accent/20">
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold">
                      <Sparkles className="h-3 w-3" /> {t("pick")}
                    </span>
                    <p className="mt-3 text-xl font-bold">{reco.name}</p>
                    {reco.originalPrice ? (
                      <p className="mt-2 text-lg text-white/70 line-through">{fmt(reco.originalPrice)} {reco.currency}</p>
                    ) : null}
                    <p className="flex items-end gap-1.5">
                      <span className="text-4xl font-bold">{fmt(reco.price)}</span>
                      <span className="pb-1 text-base text-white/80">{reco.currency}</span>
                    </p>
                    <div className="my-4 h-px bg-white/25" />
                    <ul className="space-y-2 text-sm">
                      {reco.features.slice(0, 6).map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {reco.discountAmount ? (
                      <>
                        <div className="my-4 h-px bg-white/25" />
                        <p className="flex justify-between text-sm">
                          <span>{t("save")}</span>
                          <span className="font-semibold">-{fmt(reco.discountAmount)} {reco.currency}</span>
                        </p>
                      </>
                    ) : null}
                    <Link
                      href={`/checkout?plan=${reco.slug}`}
                      onClick={() => setOpen(false)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-base font-semibold text-primary transition hover:bg-white/90"
                    >
                      {t("useThis")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-accent bg-white p-5">
                    <p className="text-sm text-primary/75">{t("customNote")}</p>
                  </div>
                )}

                {reco && others.length ? (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary/50">{t("orOthers")}</p>
                    <div className="space-y-2">
                      {others.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/checkout?plan=${p.slug}`}
                          onClick={() => setOpen(false)}
                          className={cn(optionBtn, "justify-between")}
                        >
                          <span className="font-medium">{p.name}</span>
                          <span className="text-primary/60">
                            {fmt(p.price)} {p.currency}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                <Link
                  href="/ressources/devis"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-accent px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white"
                >
                  {t("customQuote")}
                </Link>
              </div>
            ) : null}

            {mode === "chat" ? (
              <>
                {messages.map((msg, index) => (
                  <div key={`${msg.role}-${index}`} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
                        msg.role === "user" ? "bg-accent text-white" : "bg-[#F4F2FF] text-primary"
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "assistant" ? (
                      <div className="mt-1.5 flex items-center gap-3 px-1 text-primary/45">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <ThumbsDown className="h-3.5 w-3.5" />
                        <span className="text-xs">{msg.time}</span>
                      </div>
                    ) : null}
                  </div>
                ))}
                {loading ? (
                  <div className="me-auto flex w-fit gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm" aria-label={t("typing")}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-accent/60" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                ) : null}
                {!loading && suggestions.length ? (
                  <div className="flex flex-col items-start gap-2 pt-1">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void send(s)}
                        className="rounded-full border border-accent/30 bg-white px-3.5 py-1.5 text-start text-xs font-medium text-accent transition hover:bg-accent hover:text-white"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : null}
                {handoff && !loading ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    {t("humanDone")}{" "}
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                      WhatsApp
                    </a>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="border-t border-primary/10 bg-white p-3">
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                disabled={loading}
                maxLength={2000}
                className="h-11 flex-1 rounded-xl border border-primary/15 px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white transition disabled:opacity-40"
              >
                <Send className="h-4 w-4 rtl:-scale-x-100" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => void talkToHuman()}
                disabled={loading || handoff}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-primary/70 hover:text-accent disabled:opacity-50"
              >
                <Headset className="h-3.5 w-3.5" /> {t("human")}
              </button>
              <p className="text-[10px] text-primary/40">{t("disclaimer")}</p>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="chat-fab pointer-events-auto relative grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-xl shadow-accent/30 transition hover:-translate-y-0.5 active:scale-95"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t("close") : t("open")}
        title={open ? t("close") : t("open")}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <span className="absolute inset-0 rounded-full bg-accent/40 motion-safe:animate-ping [animation-duration:2.6s]" aria-hidden />
            <MessageCircle className="relative h-6 w-6" />
            {/* Small "AI is typing" bubble that pops up periodically to invite a click */}
            <span className="chat-hint pointer-events-none absolute -top-3 end-1 flex items-center gap-1 rounded-2xl rounded-br-sm bg-white px-2.5 py-2 shadow-lg" aria-hidden>
              <i className="chat-dot" />
              <i className="chat-dot [animation-delay:.15s]" />
              <i className="chat-dot [animation-delay:.3s]" />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
