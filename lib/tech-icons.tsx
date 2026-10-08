import type { IconType } from "react-icons";
import { ShoppingBag, SquareCode, Sparkles } from "lucide-react";
import { DiHtml5, DiCss3, DiJava, DiPhp } from "react-icons/di";
import {
  SiJavascript,
  SiLaravel,
  SiFlutter,
  SiSwift,
  SiTypescript,
  SiReact,
  SiAngular,
  SiBootstrap,
  SiWordpress,
  SiWoocommerce,
  SiElementor,
  SiClaude,
  SiCursor,
  SiAndroid,
  SiApple,
  SiNodedotjs,
  SiKotlin,
  SiN8N,
  SiNextdotjs,
  SiStripe,
  SiFigma,
} from "react-icons/si";

export type TechIcon = {
  Icon: IconType | typeof ShoppingBag;
  bg: string;
  fg: string;
  label: string;
};

/** Full tech stack shown on the founder section. */
export const techStack: TechIcon[] = [
  { Icon: SiJavascript, bg: "bg-[#F7DF1E]", fg: "text-[#292D32]", label: "JavaScript" },
  { Icon: SiTypescript, bg: "bg-white", fg: "text-[#3178C6]", label: "TypeScript" },
  { Icon: SiReact, bg: "bg-white", fg: "text-[#61DAFB]", label: "React" },
  { Icon: SiAngular, bg: "bg-white", fg: "text-[#DD0031]", label: "Angular" },
  { Icon: SiNextdotjs, bg: "bg-white", fg: "text-[#000000]", label: "Next.js" },
  { Icon: DiJava, bg: "bg-white", fg: "text-[#EA2D2E]", label: "Java" },
  { Icon: DiHtml5, bg: "bg-white", fg: "text-[#E44D26]", label: "HTML5" },
  { Icon: DiCss3, bg: "bg-white", fg: "text-[#2965F1]", label: "CSS3" },
  { Icon: SiBootstrap, bg: "bg-white", fg: "text-[#7952B3]", label: "Bootstrap" },
  { Icon: DiPhp, bg: "bg-white", fg: "text-[#777BB4]", label: "PHP" },
  { Icon: SiLaravel, bg: "bg-white", fg: "text-[#FF2D20]", label: "Laravel" },
  { Icon: SiFlutter, bg: "bg-white", fg: "text-[#02569B]", label: "Flutter" },
  { Icon: SiSwift, bg: "bg-white", fg: "text-[#F05138]", label: "Swift" },
  { Icon: SiAndroid, bg: "bg-white", fg: "text-[#3DDC84]", label: "Android" },
  { Icon: SiApple, bg: "bg-white", fg: "text-[#292D32]", label: "iOS" },
  { Icon: SiNodedotjs, bg: "bg-white", fg: "text-[#5FA04E]", label: "Node.js" },
  { Icon: SiKotlin, bg: "bg-white", fg: "text-[#7F52FF]", label: "Kotlin" },
  { Icon: SiWordpress, bg: "bg-white", fg: "text-[#21759B]", label: "WordPress" },
  { Icon: ShoppingBag, bg: "bg-white", fg: "text-[#EE672F]", label: "Magento" },
  { Icon: SiWoocommerce, bg: "bg-white", fg: "text-[#96588A]", label: "WooCommerce" },
  { Icon: SiElementor, bg: "bg-white", fg: "text-[#92003B]", label: "Elementor" },
  { Icon: SiStripe, bg: "bg-white", fg: "text-[#635BFF]", label: "Stripe" },
  { Icon: SiFigma, bg: "bg-white", fg: "text-[#F24E1E]", label: "Figma" },
  { Icon: SiN8N, bg: "bg-white", fg: "text-[#EA4B71]", label: "n8n" },
  { Icon: SiClaude, bg: "bg-white", fg: "text-[#D97757]", label: "Claude" },
  { Icon: SquareCode, bg: "bg-white", fg: "text-[#007ACC]", label: "VS Code" },
  { Icon: Sparkles, bg: "bg-white", fg: "text-[#292D32]", label: "Antigravity" },
  { Icon: SiCursor, bg: "bg-white", fg: "text-[#292D32]", label: "Cursor" },
];

/** Keyword → icon lookup, used to detect a known technology inside a free-text label. */
const keywordIcons: { pattern: RegExp; icon: TechIcon }[] = [
  { pattern: /next\.?js/i, icon: techStack.find((t) => t.label === "Next.js")! },
  { pattern: /typescript/i, icon: techStack.find((t) => t.label === "TypeScript")! },
  { pattern: /react native|react/i, icon: techStack.find((t) => t.label === "React")! },
  { pattern: /angular/i, icon: techStack.find((t) => t.label === "Angular")! },
  { pattern: /flutter/i, icon: techStack.find((t) => t.label === "Flutter")! },
  { pattern: /swift/i, icon: techStack.find((t) => t.label === "Swift")! },
  { pattern: /android/i, icon: techStack.find((t) => t.label === "Android")! },
  { pattern: /\bios\b/i, icon: techStack.find((t) => t.label === "iOS")! },
  { pattern: /kotlin/i, icon: techStack.find((t) => t.label === "Kotlin")! },
  { pattern: /node\.?js/i, icon: techStack.find((t) => t.label === "Node.js")! },
  { pattern: /wordpress/i, icon: techStack.find((t) => t.label === "WordPress")! },
  { pattern: /woocommerce/i, icon: techStack.find((t) => t.label === "WooCommerce")! },
  { pattern: /magento/i, icon: techStack.find((t) => t.label === "Magento")! },
  { pattern: /elementor/i, icon: techStack.find((t) => t.label === "Elementor")! },
  { pattern: /laravel/i, icon: techStack.find((t) => t.label === "Laravel")! },
  { pattern: /\bphp\b/i, icon: techStack.find((t) => t.label === "PHP")! },
  { pattern: /\bjava\b/i, icon: techStack.find((t) => t.label === "Java")! },
  { pattern: /javascript/i, icon: techStack.find((t) => t.label === "JavaScript")! },
  { pattern: /\bhtml5?\b/i, icon: techStack.find((t) => t.label === "HTML5")! },
  { pattern: /\bcss3?\b/i, icon: techStack.find((t) => t.label === "CSS3")! },
  { pattern: /bootstrap/i, icon: techStack.find((t) => t.label === "Bootstrap")! },
  { pattern: /stripe/i, icon: techStack.find((t) => t.label === "Stripe")! },
  { pattern: /figma/i, icon: techStack.find((t) => t.label === "Figma")! },
  { pattern: /n8n/i, icon: techStack.find((t) => t.label === "n8n")! },
  { pattern: /claude/i, icon: techStack.find((t) => t.label === "Claude")! },
  { pattern: /cursor/i, icon: techStack.find((t) => t.label === "Cursor")! },
];

/** Returns the matching tech icon for a free-text label, if any. */
export function matchTechIcon(label: string): TechIcon | null {
  for (const { pattern, icon } of keywordIcons) {
    if (pattern.test(label)) return icon;
  }
  return null;
}

function pick(...labels: string[]): TechIcon[] {
  return labels
    .map((label) => techStack.find((t) => t.label === label))
    .filter((t): t is TechIcon => Boolean(t));
}

/** Curated real tech stack shown on each service detail page, by service slug. */
export const serviceTechStacks: Record<string, TechIcon[]> = {
  "web-development": pick(
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "PHP",
    "Laravel",
    "HTML5",
    "CSS3",
    "Bootstrap"
  ),
  "mobile-apps": pick("Flutter", "React", "Swift", "Kotlin", "Android", "iOS"),
  saas: pick("Next.js", "TypeScript", "Node.js", "Stripe"),
  wordpress: pick("WordPress", "WooCommerce", "Elementor", "PHP"),
  migration: pick("Next.js", "Node.js", "PHP", "WordPress"),
  "ai-automation": pick("n8n", "Claude", "Node.js", "TypeScript"),
  "ui-ux": pick("Figma"),
  seo: pick("Next.js", "WordPress"),
  "hosting-domain": pick("Node.js"),
};
