"use client";

import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { localPaymentMethods, internationalPaymentMethods } from "@/lib/payment-methods";

type PaymentMethodsGridProps = {
  title: string;
  description: string;
  variant: "local" | "international";
};

export function PaymentMethodsGrid({ title, description, variant }: PaymentMethodsGridProps) {
  const methods = variant === "local" ? localPaymentMethods : internationalPaymentMethods;
  return (
    <LazyMotion features={domAnimation} strict>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-primary">{title}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {methods.map(({ logo, label }, i) => (
            <m.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-primary/10 bg-background p-5 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <m.span
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-xl shadow-sm ring-1 ring-primary/5"
              >
                <Image
                  src={logo}
                  alt={label}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </m.span>
              <span className="text-xs font-medium leading-tight text-primary/80">{label}</span>
            </m.div>
          ))}
        </div>
      </section>
    </LazyMotion>
  );
}
