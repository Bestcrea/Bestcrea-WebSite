import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  inverted?: boolean;
};

export function Logo({ className, inverted = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 font-semibold tracking-tight",
        inverted ? "text-primary-foreground" : "text-primary",
        className
      )}
      aria-label="Bestcrea"
    >
      <span
        className={cn(
          "relative grid h-10 w-10 shrink-0 place-items-center transition-transform duration-300 group-hover:scale-105",
          inverted && "rounded-lg bg-white p-1"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={40} height={40} className="h-full w-full object-contain" />
      </span>
      <span className="text-lg md:text-xl">
        Best
        <span className={inverted ? "text-accent" : "text-primary group-hover:text-primary"}>
          crea
        </span>
      </span>
    </Link>
  );
}
