"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { Rocket, RefreshCw, TrendingUp } from "lucide-react";

type Story = {
  title: string;
  body: string;
};

const icons = [Rocket, RefreshCw, TrendingUp];

export function ClientStories({ title, stories }: { title: string; stories: Story[] }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-primary">{title}</h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {stories.map((story, i) => {
            const Icon = icons[i % icons.length];
            return (
              <m.article
                key={story.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-[#7A35FF]/10"
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7A35FF] to-[#9B6BFF] opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7A35FF]/10 text-[#7A35FF] transition-colors group-hover:bg-[#7A35FF] group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-primary">{story.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {story.body}
                </p>
              </m.article>
            );
          })}
        </div>
      </section>
    </LazyMotion>
  );
}
