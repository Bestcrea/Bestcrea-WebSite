import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { PortfolioSite } from "@/lib/portfolio-sites";

type WebsiteBrowserCardProps = {
  site: PortfolioSite;
};

export function WebsiteBrowserCard({ site }: WebsiteBrowserCardProps) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-primary/10 bg-primary/[0.03] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" aria-hidden />
        <span className="ms-2 flex-1 truncate rounded-full bg-white px-3 py-1 text-[11px] text-primary/50 ring-1 ring-primary/10">
          {site.url.replace(/^https?:\/\//, "")}
        </span>
        <ExternalLink
          className="h-3.5 w-3.5 shrink-0 text-primary/30 transition-colors group-hover:text-[#7A35FF]"
          aria-hidden
        />
      </div>

      {/* Static screenshot */}
      <div className="relative h-64 overflow-hidden bg-primary/5">
        <Image
          src={site.screenshot}
          alt={site.name}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover object-top"
        />
      </div>

      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-primary">{site.name}</p>
        <p className="text-xs text-muted-foreground">{site.category}</p>
      </div>
    </a>
  );
}
