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
          "relative grid h-9 w-9 place-items-center rounded-lg text-sm font-bold transition-transform duration-300 group-hover:scale-105",
          inverted
            ? "bg-accent text-accent-foreground"
            : "bg-primary text-primary-foreground group-hover:bg-accent group-hover:text-accent-foreground"
        )}
      >
        BC
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
