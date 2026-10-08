"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type ServiceExpertiseProps = {
  title: string;
  description: string;
  features: string[];
};

export function ServiceExpertise({ title, description, features }: ServiceExpertiseProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-primary">{title}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <m.div
              key={feature}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.08 }}
              className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[0.03] p-5"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#7A35FF]/10 text-[#7A35FF]">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-medium text-primary">{feature}</span>
            </m.div>
          ))}
        </div>
      </section>
    </LazyMotion>
  );
}
