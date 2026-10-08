"use client";

import { FormEvent, Suspense, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Loader2, MessageCircle, ShieldCheck, Tag, Upload } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { RegisterForm } from "@/components/client/register-form";
import { LoginForm } from "@/components/client/login-form";
import type { PaymentOption } from "@/lib/payment-config";
import type { CartPricing } from "@/lib/checkout";

type Plan = {
  slug: string;
  name: string;
  description: string;
  features: string[];
  currency: string;
  billingPeriod: string;
  originalPrice: number | null;
};

type Props = {
  authed: boolean;
  userName: string;
  plan: Plan;
  basePricing: CartPricing;
  options: PaymentOption[];
};

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PERIODS: Record<string, string> = { month: "mois", year: "an", once: "paiement unique", one_time: "paiement unique" };

type Step = "cart" | "account" | "payment";

export function CheckoutFlow({ authed, userName, plan, basePricing, options }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const [step, setStep] = useState<Step>(authed ? "cart" : "cart");
  const [accountTab, setAccountTab] = useState<"register" | "login">("register");

  const [pricing, setPricing] = useState<CartPricing>(basePricing);
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const [method, setMethod] = useState<string>(options[0]?.id ?? "");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const period = PERIODS[plan.billingPeriod] ?? plan.billingPeriod;
  const selected = options.find((o) => o.id === method);
  const checkoutUrl = `/${locale}/checkout?plan=${plan.slug}`;

  async function applyCoupon(e: FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    setCouponMsg(null);
    const res = await fetch("/api/checkout/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planSlug: plan.slug, code: couponInput }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string; code?: string; pricing?: CartPricing } | null;
    setCouponBusy(false);
    if (!res.ok || !data?.pricing) {
      setCouponCode(null);
      setPricing(basePricing);
      return setCouponMsg({ ok: false, text: data?.error || "Code invalide." });
    }
    setCouponCode(data.code ?? couponInput);
    setPricing(data.pricing);
    setCouponMsg({ ok: true, text: `Code ${data.code} appliqué.` });
  }

  function removeCoupon() {
    setCouponCode(null);
    setCouponInput("");
    setPricing(basePricing);
    setCouponMsg(null);
  }

  function onContinue() {
    setError("");
    setStep(authed ? "payment" : "account");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function placeOrder() {
    if (!selected) return;
    setError("");
    if (selected.kind === "transfer" && !reference.trim() && !file) {
      return setError("Indiquez la référence de votre transfert ou joignez un justificatif.");
    }
    setBusy(true);
    try {
      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: plan.slug, couponCode, method, reference, customerNotes: notes }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; order?: { id: string } } | null;
      if (!res.ok || !data?.order) throw new Error(data?.error || "Impossible de créer la commande.");
      const orderId = data.order.id;

      if (selected.kind === "paypal") {
        const pp = await fetch("/api/checkout/paypal/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, locale }),
        });
        const ppData = (await pp.json().catch(() => null)) as { approveUrl?: string; error?: string } | null;
        if (!pp.ok || !ppData?.approveUrl) {
          router.push(`/espace-client/commandes/${orderId}?paypalError=1`);
          return;
        }
        window.location.href = ppData.approveUrl;
        return;
      }

      if (file) {
        const form = new FormData();
        form.append("proof", file);
        if (reference.trim()) form.append("reference", reference.trim());
        const up = await fetch(`/api/checkout/orders/${orderId}/proof`, { method: "POST", body: form });
        if (!up.ok) {
          const err = (await up.json().catch(() => null)) as { error?: string } | null;
          // The order exists: send the client to it so they can retry the upload there.
          router.push(`/espace-client/commandes/${orderId}?uploadError=${encodeURIComponent(err?.error ?? "")}`);
          return;
        }
      }
      router.push(`/espace-client/commandes/${orderId}?new=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Steps */}
      <ol className="flex items-center gap-2 text-sm">
        {([["cart", "Panier"], ["account", "Compte"], ["payment", "Paiement"]] as const).map(([id, label], i) => {
          const order = ["cart", "account", "payment"];
          const done = order.indexOf(step) > i || (id === "account" && authed && step === "payment");
          const active = step === id;
          return (
            <li key={id} className="flex items-center gap-2">
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", active ? "bg-[#7A35FF] text-white" : done ? "bg-emerald-500 text-white" : "bg-neutral-200 text-neutral-600")}>
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cn(active ? "font-semibold text-neutral-900" : "text-neutral-500")}>{label}</span>
              {i < 2 ? <span className="mx-1 h-px w-6 bg-neutral-300" /> : null}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* LEFT */}
        <div className="space-y-5">
          {step === "cart" ? (
            <>
              <h1 className="text-2xl font-semibold text-neutral-900">Votre panier</h1>
              <div className="rounded-2xl border bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">{plan.name}</h2>
                    {plan.description ? <p className="mt-1 text-sm text-neutral-600">{plan.description}</p> : null}
                    <p className="mt-2 text-xs text-neutral-500">Facturation : {period}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900">{fmt(basePricing.subtotal)} {plan.currency}</p>
                    {plan.originalPrice && plan.originalPrice > basePricing.subtotal ? (
                      <p className="text-sm text-neutral-400 line-through">{fmt(plan.originalPrice)} {plan.currency}</p>
                    ) : null}
                    <p className="text-xs text-neutral-500">HT</p>
                  </div>
                </div>
                {plan.features.length ? (
                  <ul className="mt-5 grid gap-2 border-t pt-5 sm:grid-cols-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {f}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </>
          ) : null}

          {step === "account" ? (
            <>
              <button type="button" onClick={() => setStep("cart")} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
                <ChevronLeft className="h-4 w-4" /> Retour au panier
              </button>
              <h1 className="text-2xl font-semibold text-neutral-900">Créez votre compte ou connectez-vous</h1>
              <div className="rounded-2xl border bg-white p-6">
                <div className="mb-5 inline-flex rounded-xl bg-neutral-100 p-1 text-sm">
                  {(["register", "login"] as const).map((tab) => (
                    <button key={tab} type="button" onClick={() => setAccountTab(tab)} className={cn("rounded-lg px-4 py-1.5 font-medium transition", accountTab === tab ? "bg-white shadow-sm" : "text-neutral-500")}>
                      {tab === "register" ? "Nouveau client" : "J'ai déjà un compte"}
                    </button>
                  ))}
                </div>
                {accountTab === "register" ? (
                  <RegisterForm embedded callbackUrl={checkoutUrl} onRegistered={() => { window.location.href = checkoutUrl; }} />
                ) : (
                  <Suspense fallback={null}>
                    <LoginForm embedded callbackUrl={checkoutUrl} />
                  </Suspense>
                )}
              </div>
            </>
          ) : null}

          {step === "payment" ? (
            <>
              <button type="button" onClick={() => setStep("cart")} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
                <ChevronLeft className="h-4 w-4" /> Retour au panier
              </button>
              <h1 className="text-2xl font-semibold text-neutral-900">Choisissez votre mode de paiement</h1>
              <p className="text-sm text-neutral-600">Connecté en tant que <strong>{userName}</strong>.</p>

              <div className="space-y-3">
                {options.map((o) => (
                  <label key={o.id} className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border bg-white p-4 transition", method === o.id ? "border-[#7A35FF] ring-2 ring-[#7A35FF]/20" : "hover:border-neutral-300")}>
                    <input type="radio" name="method" value={o.id} checked={method === o.id} onChange={() => setMethod(o.id)} className="h-4 w-4 accent-[#7A35FF]" />
                    <span className="relative h-8 w-14 shrink-0">
                      <Image src={o.logo} alt="" fill sizes="56px" className="object-contain" />
                    </span>
                    <span className="font-medium text-neutral-900">{o.label}</span>
                  </label>
                ))}
              </div>

              {selected ? (
                <div className="rounded-2xl border bg-white p-5">
                  <ul className="space-y-1.5 text-sm text-neutral-700">
                    {selected.instructions.map((l) => <li key={l}>{l}</li>)}
                  </ul>
                  {selected.whatsapp ? (
                    <a href={selected.whatsapp.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                      <MessageCircle className="h-4 w-4" /> {selected.whatsapp.label}
                    </a>
                  ) : null}

                  {selected.kind !== "paypal" ? (
                    <div className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2">
                      <label className="block text-xs font-medium text-neutral-600">
                        Référence du paiement {selected.kind === "transfer" ? "*" : "(optionnel, vous pouvez l'ajouter plus tard)"}
                        <input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                      </label>
                      <label className="block text-xs font-medium text-neutral-600">
                        Justificatif (PDF, JPG, PNG — 5 Mo max)
                        <span className="mt-1 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-sm text-neutral-600 hover:border-[#7A35FF]">
                          <Upload className="h-4 w-4" /> {file ? file.name : "Choisir un fichier"}
                          <input type="file" accept="application/pdf,image/png,image/jpeg" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                        </span>
                      </label>
                      <p className="text-xs text-neutral-500 sm:col-span-2">
                        Votre commande est créée tout de suite ; elle est confirmée dès que notre équipe a vérifié votre paiement.
                      </p>
                    </div>
                  ) : null}

                  <label className="mt-4 block text-xs font-medium text-neutral-600">
                    Remarque (optionnel)
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={1000} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
                  </label>
                </div>
              ) : (
                <p className="text-sm text-neutral-600">Aucun moyen de paiement n&apos;est disponible pour le moment.</p>
              )}
            </>
          ) : null}
        </div>

        {/* RIGHT: order summary */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Résumé de la commande</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-neutral-700">{plan.name}</span>
              <span>{fmt(pricing.subtotal)} {plan.currency}</span>
            </div>
            {pricing.discount > 0 ? (
              <div className="mt-2 flex justify-between text-sm text-emerald-700">
                <span>Réduction {couponCode ? `(${couponCode})` : ""}</span>
                <span>- {fmt(pricing.discount)} {plan.currency}</span>
              </div>
            ) : null}
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><span className="text-neutral-600">Total HT</span><span>{fmt(pricing.totalHt)} {plan.currency}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">TVA ({pricing.vatRate}%)</span><span>{fmt(pricing.tax)} {plan.currency}</span></div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t pt-4">
              <span className="text-base font-semibold text-neutral-900">Total TTC</span>
              <span className="text-2xl font-bold text-neutral-900">{fmt(pricing.total)} {plan.currency}</span>
            </div>

            {/* Coupon */}
            <div className="mt-4">
              {couponCode ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  <span className="flex items-center gap-2"><Tag className="h-4 w-4" /> {couponCode}</span>
                  <button type="button" onClick={removeCoupon} className="text-xs underline">Retirer</button>
                </div>
              ) : couponOpen ? (
                <form onSubmit={applyCoupon} className="flex gap-2">
                  <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Code promo" maxLength={40} className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm uppercase" />
                  <button type="submit" disabled={couponBusy} className="rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white disabled:opacity-60">
                    {couponBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
                  </button>
                </form>
              ) : (
                <button type="button" onClick={() => setCouponOpen(true)} className="text-sm font-semibold text-[#7A35FF] hover:underline">
                  Avez-vous un code promo ?
                </button>
              )}
              {couponMsg && !couponMsg.ok ? <p className="mt-2 text-xs text-red-600">{couponMsg.text}</p> : null}
            </div>

            {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

            {step === "cart" ? (
              <button type="button" onClick={onContinue} className="mt-5 w-full rounded-xl bg-[#7A35FF] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90">
                Continuer
              </button>
            ) : null}
            {step === "payment" ? (
              <button type="button" onClick={placeOrder} disabled={busy || !selected} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7A35FF] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {selected?.kind === "paypal" ? "Payer avec PayPal" : "Confirmer la commande"}
              </button>
            ) : null}
          </div>

          <p className="flex items-center justify-center gap-2 text-center text-sm text-neutral-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Assistance 24h/7j · Paiement vérifié par notre équipe
          </p>
          <p className="text-center text-xs text-neutral-500">
            En continuant, vous acceptez notre <Link href="/ressources/politique-confidentialite" className="underline">politique de confidentialité</Link>.
          </p>
        </aside>
      </div>
    </div>
  );
}
