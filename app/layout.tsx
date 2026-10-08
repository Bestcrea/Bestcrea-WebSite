import type { ReactNode } from "react";
import "./globals.css";

type Props = {
  children: ReactNode;
};

// Required by Next.js; html/body live in app/[locale]/layout.tsx for i18n + RTL.
export default function RootLayout({ children }: Props) {
  return children;
}
