"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-xl border border-primary/15 bg-white py-2.5 text-sm text-primary outline-none transition placeholder:text-primary/35 focus:border-accent focus:ring-2 focus:ring-accent/25";

export function AuthLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-sm font-medium text-primary">{children}</span>;
}

type IconInputProps = InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode };

/** Text input with a leading icon. */
export function IconInput({ icon, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-primary/40 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <input {...props} className={cn(base, "ps-10 pe-3", className)} />
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordInput({
  icon,
  showLabel,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; showLabel: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-primary/40 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <input {...props} type={visible ? "text" : "password"} className={cn(base, "ps-10 pe-10", className)} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={showLabel}
        className="absolute end-3 top-1/2 -translate-y-1/2 text-primary/40 transition hover:text-accent"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function PlainInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(base, "px-3", className)} />;
}

export function PlainSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn(base, "h-[42px] cursor-pointer appearance-none ps-3 pe-9", className)}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
    </div>
  );
}

/** Accessible switch used for consent and "I am a company". */
export function Switch({
  checked,
  onChange,
  children,
  name,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
  name?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/[0.02] p-3 text-sm text-primary/80">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        name={name}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-primary/20"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "start-[22px]" : "start-0.5"
          )}
        />
      </button>
      <div className="leading-snug">{children}</div>
    </div>
  );
}
