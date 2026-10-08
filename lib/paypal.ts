/**
 * Server-side PayPal REST client. Credentials come from env vars and never reach the browser.
 * PayPal does not settle in MAD, so amounts are converted with PAYPAL_MAD_PER_UNIT
 * (e.g. 10 MAD per 1 USD) into PAYPAL_CURRENCY (default USD).
 */
const BASE = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || "USD";

export function toPaypalAmount(amountMad: number) {
  const rate = Number(process.env.PAYPAL_MAD_PER_UNIT || 10);
  return (Math.round((amountMad / rate) * 100) / 100).toFixed(2);
}

async function accessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("PayPal auth failed");
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function createPaypalOrder(params: { reference: string; amountMad: number; returnUrl: string; cancelUrl: string }) {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      payment_source: {
        paypal: {
          experience_context: {
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
          },
        },
      },
      purchase_units: [
        {
          reference_id: params.reference,
          description: `Bestcrea ${params.reference}`,
          amount: { currency_code: PAYPAL_CURRENCY, value: toPaypalAmount(params.amountMad) },
        },
      ],
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("PayPal order creation failed");
  return (await res.json()) as { id: string; links: { rel: string; href: string }[] };
}

export type PaypalCapture = {
  status: string;
  purchase_units?: {
    reference_id?: string;
    payments?: { captures?: { id: string; status: string; amount: { currency_code: string; value: string } }[] };
  }[];
};

export async function capturePaypalOrder(paypalOrderId: string) {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("PayPal capture failed");
  return (await res.json()) as PaypalCapture;
}
