import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_ROLE_PERMISSIONS, STAFF_ROLES } from "../lib/rbac";

const prisma = new PrismaClient();

const CLIENT_EMAIL = "client@bestcrea.test";
const CLIENT_PASSWORD = "Client123!";
const ADMIN_EMAIL = "admin@bestcrea.test";
const ADMIN_PASSWORD = "Admin123!";

function L(fr: string, en: string, ar: string, es: string, de: string) {
  return { fr, en, ar, es, de };
}

const ctaDiscover = L(
  "Découvrir l'offre",
  "Discover the offer",
  "اكتشف العرض",
  "Descubrir la oferta",
  "Angebot entdecken"
);

const plans = [
  {
    slug: "site-web-5-pages-cms",
    sortOrder: 1,
    isFeatured: false,
    price: 1799,
    originalPrice: 2000,
    discountAmount: 201,
    name: L(
      "Site Web 5 Pages CMS",
      "5-Page CMS Website",
      "موقع ويب CMS من 5 صفحات",
      "Sitio web CMS de 5 páginas",
      "Website CMS mit 5 Seiten"
    ),
    description: L(
      "Un site vitrine rapide, administrable et adapté au mobile, avec une option de livraison express en un jour ouvré.",
      "A fast, manageable, mobile-ready brochure site, with an optional next-business-day express delivery.",
      "موقع تعريفي سريع وقابل للإدارة ومتوافق مع الجوال، مع خيار تسليم مستعجل في يوم عمل واحد.",
      "Un sitio vitrina rápido, administrable y adaptado al móvil, con opción de entrega express en un día laborable.",
      "Eine schnelle, verwaltbare, mobiloptimierte Broschüren-Website, mit optionaler Expresslieferung an einem Werktag."
    ),
    ctaLabel: ctaDiscover,
    features: {
      fr: [
        "Jusqu'à 5 pages standard",
        "Nom de domaine et hébergement 1 an gratuit",
        "Design responsive et administrable",
        "Formation de gestion du projet",
        "SEO RankMath Pro",
        "Support 6 mois gratuits",
        "Certificat SSL inclus",
        "Formulaire de contact intégré",
        "Optimisation vitesse et mobile-first",
        "Livraison express en 1 jour ouvré (option)",
      ],
      en: [
        "Up to 5 standard pages",
        "Domain name and hosting free for 1 year",
        "Responsive, manageable design",
        "Project management training",
        "RankMath Pro SEO",
        "6 months of free support",
        "SSL certificate included",
        "Built-in contact form",
        "Speed and mobile-first optimization",
        "Next-business-day express delivery (option)",
      ],
      ar: [
        "حتى 5 صفحات قياسية",
        "اسم نطاق واستضافة مجاناً لسنة واحدة",
        "تصميم متجاوب وقابل للإدارة",
        "تدريب على إدارة المشروع",
        "سيو RankMath Pro",
        "دعم مجاني لمدة 6 أشهر",
        "شهادة SSL مُضمّنة",
        "نموذج تواصل مدمج",
        "تحسين السرعة وتصميم يراعي الجوال أولاً",
        "تسليم مستعجل في يوم عمل واحد (اختياري)",
      ],
      es: [
        "Hasta 5 páginas estándar",
        "Dominio y hosting gratis 1 año",
        "Diseño responsive y administrable",
        "Formación de gestión del proyecto",
        "SEO RankMath Pro",
        "Soporte gratuito 6 meses",
        "Certificado SSL incluido",
        "Formulario de contacto integrado",
        "Optimización de velocidad y mobile-first",
        "Entrega express en 1 día laborable (opción)",
      ],
      de: [
        "Bis zu 5 Standardseiten",
        "Domain und Hosting 1 Jahr kostenlos",
        "Responsives, verwaltbares Design",
        "Schulung zur Projektverwaltung",
        "RankMath Pro SEO",
        "6 Monate kostenloser Support",
        "SSL-Zertifikat inklusive",
        "Integriertes Kontaktformular",
        "Geschwindigkeits- und Mobile-First-Optimierung",
        "Express-Lieferung in 1 Werktag (optional)",
      ],
    },
  },
  {
    slug: "site-web-seo-local-laravel",
    sortOrder: 2,
    isFeatured: true,
    price: 2999,
    originalPrice: 4500,
    discountAmount: 1501,
    name: L(
      "Site Web + SEO Local Laravel",
      "Website + Local SEO Laravel",
      "موقع ويب + سيو محلي Laravel",
      "Sitio web + SEO local Laravel",
      "Website + lokales SEO Laravel"
    ),
    description: L(
      "Un site optimisé pour votre zone, relié à une fiche Google Business Profile structurée pour générer des appels et des messages.",
      "A site optimized for your area, connected to a structured Google Business Profile to generate calls and messages.",
      "موقع محسّن لمنطقتك، مرتبط بملف Google Business Profile منظّم لتوليد المكالمات والرسائل.",
      "Un sitio optimizado para tu zona, vinculado a una ficha de Google Business Profile estructurada para generar llamadas y mensajes.",
      "Eine für Ihre Region optimierte Website, verknüpft mit einem strukturierten Google Business Profile, um Anrufe und Nachrichten zu erzeugen."
    ),
    ctaLabel: ctaDiscover,
    features: {
      fr: [
        "Site web Laravel avec Admin Panel",
        "Nom de domaine et hébergement 1 an gratuit",
        "Design responsive et administrable",
        "Formation de gestion du projet",
        "SEO avancé configuré",
        "Support 6 mois gratuits",
        "Fiche Google Business Profile optimisée",
        "Certificat SSL inclus",
        "Rapport de positionnement mensuel",
        "Optimisation Core Web Vitals",
      ],
      en: [
        "Laravel website with admin panel",
        "Domain name and hosting free for 1 year",
        "Responsive, manageable design",
        "Project management training",
        "Advanced SEO configured",
        "6 months of free support",
        "Optimized Google Business Profile",
        "SSL certificate included",
        "Monthly ranking report",
        "Core Web Vitals optimization",
      ],
      ar: [
        "موقع Laravel مع لوحة إدارة",
        "اسم نطاق واستضافة مجاناً لسنة واحدة",
        "تصميم متجاوب وقابل للإدارة",
        "تدريب على إدارة المشروع",
        "سيو متقدم مُعدّ",
        "دعم مجاني لمدة 6 أشهر",
        "ملف Google Business Profile محسَّن",
        "شهادة SSL مُضمّنة",
        "تقرير شهري عن الترتيب",
        "تحسين مؤشرات Core Web Vitals",
      ],
      es: [
        "Sitio web Laravel con panel de administración",
        "Dominio y hosting gratis 1 año",
        "Diseño responsive y administrable",
        "Formación de gestión del proyecto",
        "SEO avanzado configurado",
        "Soporte gratuito 6 meses",
        "Ficha de Google Business Profile optimizada",
        "Certificado SSL incluido",
        "Informe mensual de posicionamiento",
        "Optimización de Core Web Vitals",
      ],
      de: [
        "Laravel-Website mit Admin-Panel",
        "Domain und Hosting 1 Jahr kostenlos",
        "Responsives, verwaltbares Design",
        "Schulung zur Projektverwaltung",
        "Erweitertes SEO konfiguriert",
        "6 Monate kostenloser Support",
        "Optimiertes Google Business Profile",
        "SSL-Zertifikat inklusive",
        "Monatlicher Ranking-Bericht",
        "Core-Web-Vitals-Optimierung",
      ],
    },
  },
  {
    slug: "site-web-google-ads",
    sortOrder: 3,
    isFeatured: false,
    price: 5900,
    originalPrice: 6900,
    discountAmount: 1000,
    name: L(
      "Site Web + Google Ads",
      "Website + Google Ads",
      "موقع ويب + إعلانات Google",
      "Sitio web + Google Ads",
      "Website + Google Ads"
    ),
    description: L(
      "Une landing page, une campagne Search et un tracking propre pour transformer les recherches Google en demandes mesurables.",
      "A landing page, a Search campaign and clean tracking to turn Google searches into measurable inquiries.",
      "صفحة هبوط وحملة بحث وتتبع نظيف لتحويل عمليات البحث على Google إلى طلبات قابلة للقياس.",
      "Una landing page, una campaña Search y un tracking limpio para convertir las búsquedas de Google en solicitudes medibles.",
      "Eine Landingpage, eine Search-Kampagne und sauberes Tracking, um Google-Suchen in messbare Anfragen zu verwandeln."
    ),
    ctaLabel: ctaDiscover,
    features: {
      fr: [
        "Site web Laravel avec Admin Panel",
        "Nom de domaine et hébergement 1 an gratuit",
        "Design responsive et administrable",
        "Formation de gestion du projet",
        "SEO avancé configuré",
        "Support 6 mois gratuits",
        "Fiche Google Business Profile optimisée",
        "Landing page ou mini-site",
        "Campagne Google Search",
        "Certificat SSL inclus",
        "Rapport de positionnement mensuel",
        "Optimisation Core Web Vitals",
        "Suivi des conversions configuré",
        "Rapport de performance mensuel",
        "1 mois de gestion de campagne incluse",
      ],
      en: [
        "Laravel website with admin panel",
        "Domain name and hosting free for 1 year",
        "Responsive, manageable design",
        "Project management training",
        "Advanced SEO configured",
        "6 months of free support",
        "Optimized Google Business Profile",
        "Landing page or mini-site",
        "Google Search campaign",
        "SSL certificate included",
        "Monthly ranking report",
        "Core Web Vitals optimization",
        "Conversion tracking configured",
        "Monthly performance report",
        "1 month of campaign management included",
      ],
      ar: [
        "موقع Laravel مع لوحة إدارة",
        "اسم نطاق واستضافة مجاناً لسنة واحدة",
        "تصميم متجاوب وقابل للإدارة",
        "تدريب على إدارة المشروع",
        "سيو متقدم مُعدّ",
        "دعم مجاني لمدة 6 أشهر",
        "ملف Google Business Profile محسَّن",
        "صفحة هبوط أو موقع مصغّر",
        "حملة Google Search",
        "شهادة SSL مُضمّنة",
        "تقرير شهري عن الترتيب",
        "تحسين مؤشرات Core Web Vitals",
        "تتبع التحويلات مُعدّ",
        "تقرير أداء شهري",
        "شهر واحد من إدارة الحملة مُضمّن",
      ],
      es: [
        "Sitio web Laravel con panel de administración",
        "Dominio y hosting gratis 1 año",
        "Diseño responsive y administrable",
        "Formación de gestión del proyecto",
        "SEO avanzado configurado",
        "Soporte gratuito 6 meses",
        "Ficha de Google Business Profile optimizada",
        "Landing page o mini-sitio",
        "Campaña Google Search",
        "Certificado SSL incluido",
        "Informe mensual de posicionamiento",
        "Optimización de Core Web Vitals",
        "Seguimiento de conversiones configurado",
        "Informe mensual de rendimiento",
        "1 mes de gestión de campaña incluido",
      ],
      de: [
        "Laravel-Website mit Admin-Panel",
        "Domain und Hosting 1 Jahr kostenlos",
        "Responsives, verwaltbares Design",
        "Schulung zur Projektverwaltung",
        "Erweitertes SEO konfiguriert",
        "6 Monate kostenloser Support",
        "Optimiertes Google Business Profile",
        "Landingpage oder Mini-Website",
        "Google Search-Kampagne",
        "SSL-Zertifikat inklusive",
        "Monatlicher Ranking-Bericht",
        "Core-Web-Vitals-Optimierung",
        "Conversion-Tracking eingerichtet",
        "Monatlicher Performance-Bericht",
        "1 Monat Kampagnenmanagement inklusive",
      ],
    },
  },
];

const services = [
  {
    slug: "web-development",
    icon: "code",
    sortOrder: 1,
    title: L("Web Development", "Web Development", "تطوير الويب", "Web Development", "Web Development"),
    excerpt: L(
      "Sites et apps web performants et scalables.",
      "High-performance, scalable web apps.",
      "مواقع وتطبيقات ويب عالية الأداء.",
      "Sitios y apps web potentes y escalables.",
      "Leistungsstarke, skalierbare Web-Apps."
    ),
    description: L(
      "Nous concevons et développons des expériences web premium avec Next.js, TypeScript et des architectures prêtes à scaler.",
      "We design and build premium web experiences with Next.js, TypeScript and scalable architectures.",
      "نصمم ونبني تجارب ويب متميزة باستخدام Next.js وTypeScript وبنيات قابلة للتوسّع.",
      "Diseñamos y construimos experiencias web premium con Next.js, TypeScript y arquitecturas escalables.",
      "Wir designen und entwickeln Premium-Web-Erlebnisse mit Next.js, TypeScript und skalierbaren Architekturen."
    ),
    features: {
      fr: ["Next.js App Router", "SSR/SSG & SEO", "Design systems", "Intégrations API", "Perf & Core Web Vitals"],
      en: ["Next.js App Router", "SSR/SSG & SEO", "Design systems", "API integrations", "Perf & Core Web Vitals"],
      ar: ["Next.js App Router", "SSR/SSG وSEO", "أنظمة تصميم", "تكاملات API", "أداء وCore Web Vitals"],
      es: ["Next.js App Router", "SSR/SSG y SEO", "Design systems", "Integraciones API", "Perf y Core Web Vitals"],
      de: ["Next.js App Router", "SSR/SSG & SEO", "Designsysteme", "API-Integrationen", "Perf & Core Web Vitals"],
    },
  },
  {
    slug: "mobile-apps",
    icon: "smartphone",
    sortOrder: 2,
    title: L("Mobile Apps", "Mobile Apps", "تطبيقات الجوال", "Mobile Apps", "Mobile Apps"),
    excerpt: L(
      "Applications iOS & Android natives ou hybrides.",
      "Native and hybrid iOS & Android apps.",
      "تطبيقات iOS و Android أصلية أو هجينة.",
      "Apps iOS y Android nativas o híbridas.",
      "Native und hybride iOS- & Android-Apps."
    ),
    description: L(
      "Des apps mobiles fluides, centrées produit, avec une UX soignée et une livraison continue.",
      "Fluid, product-focused mobile apps with polished UX and continuous delivery.",
      "تطبيقات جوال سلسة تركز على المنتج مع UX متقن وتسليم مستمر.",
      "Apps móviles fluidas, centradas en producto, con UX cuidada y entrega continua.",
      "Fluide, produktzentrierte Mobile Apps mit refined UX und Continuous Delivery."
    ),
    features: {
      fr: ["React Native / Flutter", "Design mobile-first", "Push & analytics", "Stores readiness", "QA devices"],
      en: ["React Native / Flutter", "Mobile-first design", "Push & analytics", "Store readiness", "Device QA"],
      ar: ["React Native / Flutter", "تصميم موبايل أولاً", "إشعارات وتحليلات", "جاهزية المتاجر", "اختبار أجهزة"],
      es: ["React Native / Flutter", "Diseño mobile-first", "Push y analytics", "Listo para stores", "QA dispositivos"],
      de: ["React Native / Flutter", "Mobile-first Design", "Push & Analytics", "Store-Readiness", "Device-QA"],
    },
  },
  {
    slug: "saas",
    icon: "cloud",
    sortOrder: 3,
    title: L("SaaS", "SaaS", "SaaS", "SaaS", "SaaS"),
    excerpt: L(
      "Produits SaaS, abonnements et dashboards.",
      "SaaS products, subscriptions and dashboards.",
      "منتجات SaaS ولوحات تحكم واشتراكات.",
      "Productos SaaS, suscripciones y dashboards.",
      "SaaS-Produkte, Abos und Dashboards."
    ),
    description: L(
      "De l'idée au MRR : on construit des produits SaaS avec billing, auth, dashboards et automatisations.",
      "From idea to MRR: we build SaaS products with billing, auth, dashboards and automations.",
      "من الفكرة إلى الإيرادات: نبني منتجات SaaS مع فوترة ومصادقة ولوحات وأتمتة.",
      "De la idea al MRR: construimos productos SaaS con billing, auth, dashboards y automatizaciones.",
      "Von der Idee zum MRR: wir bauen SaaS-Produkte mit Billing, Auth, Dashboards und Automation."
    ),
    features: {
      fr: ["Auth & rôles", "Billing Stripe", "Dashboards", "Multi-tenant", "Observabilité"],
      en: ["Auth & roles", "Stripe billing", "Dashboards", "Multi-tenant", "Observability"],
      ar: ["مصادقة وأدوار", "فوترة Stripe", "لوحات تحكم", "متعدد المستأجرين", "مراقبة"],
      es: ["Auth y roles", "Billing Stripe", "Dashboards", "Multi-tenant", "Observabilidad"],
      de: ["Auth & Rollen", "Stripe Billing", "Dashboards", "Multi-Tenant", "Observability"],
    },
  },
  {
    slug: "wordpress",
    icon: "globe",
    sortOrder: 4,
    title: L("WordPress", "WordPress", "WordPress", "WordPress", "WordPress"),
    excerpt: L(
      "Thèmes premium, WooCommerce et maintenance.",
      "Premium themes, WooCommerce and care plans.",
      "قوالب مميزة وWooCommerce وصيانة.",
      "Temas premium, WooCommerce y mantenimiento.",
      "Premium-Themes, WooCommerce und Care."
    ),
    description: L(
      "Sites WordPress premium, e-commerce WooCommerce et plans de maintenance sécurisés.",
      "Premium WordPress sites, WooCommerce and secure maintenance plans.",
      "مواقع WordPress متميزة وتجارة WooCommerce وخطط صيانة آمنة.",
      "Sitios WordPress premium, WooCommerce y planes de mantenimiento seguros.",
      "Premium-WordPress-Sites, WooCommerce und sichere Wartungspläne."
    ),
    features: {
      fr: ["Thèmes custom", "WooCommerce", "Perf & cache", "Sécurité", "Maintenance"],
      en: ["Custom themes", "WooCommerce", "Perf & cache", "Security", "Maintenance"],
      ar: ["قوالب مخصصة", "WooCommerce", "أداء وتخزين", "أمان", "صيانة"],
      es: ["Temas custom", "WooCommerce", "Perf y cache", "Seguridad", "Mantenimiento"],
      de: ["Custom Themes", "WooCommerce", "Perf & Cache", "Security", "Wartung"],
    },
  },
  {
    slug: "migration",
    icon: "refresh",
    sortOrder: 5,
    title: L("Migration", "Migration", "الترحيل", "Migración", "Migration"),
    excerpt: L(
      "Reprises de projets, refontes et transfers sécurisés.",
      "Safe project takeovers, rebuilds and transfers.",
      "نقل المشاريع وإعادة البناء بأمان.",
      "Traspasos, rediseños y migraciones seguras.",
      "Sichere Übernahmen, Rebuilds und Transfers."
    ),
    description: L(
      "Migration sans downtime : audit, reprise de code, transfert data et bascule maîtrisée.",
      "Zero-downtime migration: audit, code takeover, data transfer and controlled cutover.",
      "ترحيل بلا توقف: تدقيق واستلام كود ونقل بيانات وتبديل منضبط.",
      "Migración sin downtime: auditoría, toma de código, transferencia de data y cutover controlado.",
      "Migration ohne Downtime: Audit, Code-Übernahme, Datentransfer und kontrollierter Cutover."
    ),
    features: {
      fr: ["Audit technique", "Reprise de projet", "Migration data", "SEO continuity", "Cutover plan"],
      en: ["Technical audit", "Project takeover", "Data migration", "SEO continuity", "Cutover plan"],
      ar: ["تدقيق تقني", "استلام مشروع", "ترحيل بيانات", "استمرارية SEO", "خطة تبديل"],
      es: ["Auditoría técnica", "Toma de proyecto", "Migración de data", "Continuidad SEO", "Plan de cutover"],
      de: ["Technisches Audit", "Projektübernahme", "Datenmigration", "SEO-Kontinuität", "Cutover-Plan"],
    },
  },
  {
    slug: "ai-automation",
    icon: "bot",
    sortOrder: 6,
    title: L("AI & Automation", "AI & Automation", "الذكاء والأتمتة", "AI & Automation", "AI & Automation"),
    excerpt: L(
      "n8n, chatbots et automatisations intelligentes.",
      "n8n, chatbots and intelligent workflows.",
      "n8n وروبوتات الدردشة والأتمتة.",
      "n8n, chatbots y automatizaciones inteligentes.",
      "n8n, Chatbots und intelligente Workflows."
    ),
    description: L(
      "Automatisez vos process avec n8n, des chatbots multilingues et des agents IA utiles au business.",
      "Automate processes with n8n, multilingual chatbots and business-useful AI agents.",
      "أتمتة عملياتك مع n8n وروبوتات متعددة اللغات ووكلاء ذكاء مفيدين للأعمال.",
      "Automatiza procesos con n8n, chatbots multilingües y agentes IA útiles al negocio.",
      "Automatisieren Sie Prozesse mit n8n, mehrsprachigen Chatbots und business-nützlichen KI-Agenten."
    ),
    features: {
      fr: ["Workflows n8n", "Chatbots IA", "Lead qualification", "Intégrations CRM", "Monitoring"],
      en: ["n8n workflows", "AI chatbots", "Lead qualification", "CRM integrations", "Monitoring"],
      ar: ["سير عمل n8n", "روبوتات ذكاء", "تأهيل العملاء", "تكامل CRM", "مراقبة"],
      es: ["Workflows n8n", "Chatbots IA", "Cualificación leads", "Integraciones CRM", "Monitoreo"],
      de: ["n8n Workflows", "KI-Chatbots", "Lead-Qualifizierung", "CRM-Integrationen", "Monitoring"],
    },
  },
  {
    slug: "ui-ux",
    icon: "palette",
    sortOrder: 7,
    title: L("UI/UX", "UI/UX", "UI/UX", "UI/UX", "UI/UX"),
    excerpt: L(
      "Design systems, prototypes et expériences fluides.",
      "Design systems, prototypes and fluid UX.",
      "أنظمة تصميم ونماذج وتجارب سلسة.",
      "Design systems, prototipos y UX fluida.",
      "Designsysteme, Prototypen und fluides UX."
    ),
    description: L(
      "UI/UX premium : recherche, wireframes, design system et prototypes interactifs.",
      "Premium UI/UX: research, wireframes, design systems and interactive prototypes.",
      "UI/UX متميز: بحث وإطارات وأنظمة تصميم ونماذج تفاعلية.",
      "UI/UX premium: research, wireframes, design system y prototipos interactivos.",
      "Premium UI/UX: Research, Wireframes, Design System und interaktive Prototypen."
    ),
    features: {
      fr: ["Research & parcours", "Wireframes", "Design system", "Prototypes Figma", "Motion design"],
      en: ["Research & journeys", "Wireframes", "Design system", "Figma prototypes", "Motion design"],
      ar: ["بحث ومسارات", "إطارات", "نظام تصميم", "نماذج Figma", "تصميم حركة"],
      es: ["Research y journeys", "Wireframes", "Design system", "Prototipos Figma", "Motion design"],
      de: ["Research & Journeys", "Wireframes", "Design System", "Figma-Prototypen", "Motion Design"],
    },
  },
  {
    slug: "seo",
    icon: "search",
    sortOrder: 8,
    title: L("SEO", "SEO", "SEO", "SEO", "SEO"),
    excerpt: L(
      "Référencement technique et contenu qui convertit.",
      "Technical SEO and content that converts.",
      "تحسين محركات البحث ومحتوى يحوّل.",
      "SEO técnico y contenido que convierte.",
      "Technisches SEO und Content, der konvertiert."
    ),
    description: L(
      "SEO technique, contenu et tracking pour améliorer visibilité et conversion.",
      "Technical SEO, content and tracking to grow visibility and conversion.",
      "SEO تقني ومحتوى وتتبع لتحسين الظهور والتحويل.",
      "SEO técnico, contenido y tracking para crecer en visibilidad y conversión.",
      "Technisches SEO, Content und Tracking für mehr Sichtbarkeit und Conversion."
    ),
    features: {
      fr: ["Audit technique", "Core Web Vitals", "Content SEO", "Schema & sitemap", "Reporting"],
      en: ["Technical audit", "Core Web Vitals", "SEO content", "Schema & sitemap", "Reporting"],
      ar: ["تدقيق تقني", "Core Web Vitals", "محتوى SEO", "Schema وsitemap", "تقارير"],
      es: ["Auditoría técnica", "Core Web Vitals", "Contenido SEO", "Schema y sitemap", "Reporting"],
      de: ["Technisches Audit", "Core Web Vitals", "SEO-Content", "Schema & Sitemap", "Reporting"],
    },
  },
  {
    slug: "hosting-domain",
    icon: "server",
    sortOrder: 9,
    title: L("Hosting & Domain", "Hosting & Domain", "الاستضافة والنطاق", "Hosting & Domain", "Hosting & Domain"),
    excerpt: L(
      "Hébergement, domaines et infrastructure.",
      "Hosting, domains and infrastructure.",
      "استضافة ونطاقات وبنية تحتية.",
      "Hosting, dominios e infraestructura.",
      "Hosting, Domains und Infrastruktur."
    ),
    description: L(
      "Hébergement Node.js, domaines, SSL, CDN et monitoring pour une infra stable.",
      "Node.js hosting, domains, SSL, CDN and monitoring for a stable infra.",
      "استضافة Node.js ونطاقات وSSL وCDN ومراقبة لبنية مستقرة.",
      "Hosting Node.js, dominios, SSL, CDN y monitoreo para una infra estable.",
      "Node.js-Hosting, Domains, SSL, CDN und Monitoring für stabile Infra."
    ),
    features: {
      fr: ["Domaines & DNS", "SSL & CDN", "Hosting Node.js", "Backups", "Monitoring 24/7"],
      en: ["Domains & DNS", "SSL & CDN", "Node.js hosting", "Backups", "24/7 monitoring"],
      ar: ["نطاقات وDNS", "SSL وCDN", "استضافة Node.js", "نسخ احتياطي", "مراقبة على مدار الساعة"],
      es: ["Dominios y DNS", "SSL y CDN", "Hosting Node.js", "Backups", "Monitoreo 24/7"],
      de: ["Domains & DNS", "SSL & CDN", "Node.js-Hosting", "Backups", "24/7-Monitoring"],
    },
  },
  {
    slug: "data-analytics",
    icon: "chart",
    sortOrder: 10,
    title: L("Data Analytics", "Data Analytics", "تحليل البيانات", "Data Analytics", "Data Analytics"),
    excerpt: L(
      "Dashboards et data intelligence pour piloter vos décisions.",
      "Dashboards and data intelligence to drive your decisions.",
      "لوحات تحكم وذكاء بيانات لتوجيه قراراتكم.",
      "Dashboards e inteligencia de datos para dirigir sus decisiones.",
      "Dashboards und Data Intelligence für datengestützte Entscheidungen."
    ),
    description: L(
      "Nous transformons vos données brutes en dashboards clairs et en insights actionnables, pour des décisions pilotées par la donnée.",
      "We turn your raw data into clear dashboards and actionable insights, for truly data-driven decisions.",
      "نحوّل بياناتكم الخام إلى لوحات تحكم واضحة ورؤى قابلة للتنفيذ، لاتخاذ قرارات مبنية على البيانات.",
      "Transformamos sus datos brutos en dashboards claros e insights accionables, para decisiones basadas en datos.",
      "Wir verwandeln Ihre Rohdaten in klare Dashboards und umsetzbare Insights für datengetriebene Entscheidungen."
    ),
    features: {
      fr: ["Dashboards BI", "ETL & pipelines data", "Reporting automatisé", "Data warehouse", "Analyse prédictive"],
      en: ["BI dashboards", "ETL & data pipelines", "Automated reporting", "Data warehouse", "Predictive analytics"],
      ar: ["لوحات BI", "ETL وخطوط بيانات", "تقارير آلية", "مستودع بيانات", "تحليل تنبؤي"],
      es: ["Dashboards BI", "ETL y pipelines de datos", "Reporting automatizado", "Data warehouse", "Análisis predictivo"],
      de: ["BI-Dashboards", "ETL & Datenpipelines", "Automatisiertes Reporting", "Data Warehouse", "Prädiktive Analyse"],
    },
  },
  {
    slug: "cybersecurity",
    icon: "shield",
    sortOrder: 11,
    title: L("Cybersécurité", "Cybersecurity", "الأمن السيبراني", "Ciberseguridad", "Cybersicherheit"),
    excerpt: L(
      "Audits, tests d'intrusion et durcissement pour protéger votre activité.",
      "Audits, penetration testing and hardening to protect your business.",
      "تدقيقات واختبارات اختراق وتحصين لحماية نشاطكم.",
      "Auditorías, pentesting y hardening para proteger su negocio.",
      "Audits, Penetrationstests und Härtung zum Schutz Ihres Unternehmens."
    ),
    description: L(
      "Nous sécurisons vos systèmes avec des audits, des tests d'intrusion et une surveillance continue, pour réduire les risques et protéger vos données.",
      "We secure your systems with audits, penetration tests and continuous monitoring, to reduce risk and protect your data.",
      "نؤمّن أنظمتكم عبر تدقيقات واختبارات اختراق ومراقبة مستمرة، لتقليل المخاطر وحماية بياناتكم.",
      "Aseguramos sus sistemas con auditorías, pentesting y monitoreo continuo, para reducir riesgos y proteger sus datos.",
      "Wir sichern Ihre Systeme mit Audits, Penetrationstests und kontinuierlichem Monitoring, um Risiken zu senken und Daten zu schützen."
    ),
    features: {
      fr: ["Audit de sécurité", "Tests d'intrusion", "Durcissement serveurs", "Conformité RGPD", "Monitoring 24/7"],
      en: ["Security audit", "Penetration testing", "Server hardening", "GDPR compliance", "24/7 monitoring"],
      ar: ["تدقيق أمني", "اختبارات اختراق", "تحصين الخوادم", "الامتثال لـ GDPR", "مراقبة على مدار الساعة"],
      es: ["Auditoría de seguridad", "Pentesting", "Hardening de servidores", "Cumplimiento RGPD", "Monitoreo 24/7"],
      de: ["Sicherheitsaudit", "Penetrationstests", "Server-Härtung", "DSGVO-Konformität", "24/7-Monitoring"],
    },
  },
  {
    slug: "geolocation",
    icon: "map",
    sortOrder: 12,
    title: L("Géolocalisation", "Geolocation", "تحديد الموقع الجغرافي", "Geolocalización", "Geolokalisierung"),
    excerpt: L(
      "Cartographie, tracking temps réel et géofencing sur-mesure.",
      "Mapping, real-time tracking and custom geofencing.",
      "خرائط وتتبع لحظي وأسوار جغرافية مخصصة.",
      "Cartografía, tracking en tiempo real y geofencing a medida.",
      "Kartierung, Echtzeit-Tracking und maßgeschneidertes Geofencing."
    ),
    description: L(
      "Nous intégrons des solutions de géolocalisation avancées : cartes interactives, suivi temps réel de flottes et zones de géofencing intelligentes.",
      "We integrate advanced geolocation solutions: interactive maps, real-time fleet tracking and smart geofencing zones.",
      "ندمج حلول تحديد موقع متقدمة: خرائط تفاعلية وتتبع لحظي للأساطيل ومناطق أسوار جغرافية ذكية.",
      "Integramos soluciones de geolocalización avanzadas: mapas interactivos, tracking de flotas en tiempo real y zonas de geofencing inteligentes.",
      "Wir integrieren fortschrittliche Geolokalisierungslösungen: interaktive Karten, Echtzeit-Flottenverfolgung und intelligente Geofencing-Zonen."
    ),
    features: {
      fr: ["Cartes interactives", "Tracking temps réel", "Géofencing", "API de géolocalisation", "Analytics géospatiale"],
      en: ["Interactive maps", "Real-time tracking", "Geofencing", "Geolocation API", "Geospatial analytics"],
      ar: ["خرائط تفاعلية", "تتبع لحظي", "أسوار جغرافية", "واجهة برمجة تحديد الموقع", "تحليلات جغرافية مكانية"],
      es: ["Mapas interactivos", "Tracking en tiempo real", "Geofencing", "API de geolocalización", "Analítica geoespacial"],
      de: ["Interaktive Karten", "Echtzeit-Tracking", "Geofencing", "Geolokalisierungs-API", "Geospatial Analytics"],
    },
  },
];

const blogPosts = [
  {
    slug: "lancer-un-saas-avec-nextjs",
    tags: ["saas", "nextjs", "product"],
    title: L(
      "Lancer un SaaS avec Next.js : checklist 2026",
      "Launching a SaaS with Next.js: 2026 checklist",
      "إطلاق SaaS مع Next.js: قائمة 2026",
      "Lanzar un SaaS con Next.js: checklist 2026",
      "SaaS mit Next.js starten: Checkliste 2026"
    ),
    excerpt: L(
      "Les fondations techniques et produit pour sortir un MVP SaaS solide.",
      "The technical and product foundations for a solid SaaS MVP.",
      "الأسس التقنية والمنتجية لإطلاق MVP SaaS قوي.",
      "Las bases técnicas y de producto para un MVP SaaS sólido.",
      "Technische und Produkt-Grundlagen für ein solides SaaS-MVP."
    ),
    content: L(
      "Un SaaS réussi commence par un cadrage clair, une stack fiable et une boucle feedback courte.\n\nChez Bestcrea, nous recommandons Next.js App Router, Prisma et un billing Stripe dès le MVP.\n\nEnsuite : observability, onboarding et itérations produit guidées par la data.",
      "A successful SaaS starts with clear scoping, a reliable stack and a short feedback loop.\n\nAt Bestcrea we recommend Next.js App Router, Prisma and Stripe billing from MVP.\n\nThen: observability, onboarding and data-driven product iterations.",
      "يبدأ SaaS الناجح بتأطير واضح وتقنية موثوقة وحلقة تغذية راجعة قصيرة.\n\nفي Bestcrea نوصي بـ Next.js App Router وPrisma وStripe من الـ MVP.\n\nثم: المراقبة والتأهيل وتكرارات المنتج المعتمدة على البيانات.",
      "Un SaaS exitoso empieza con un encaje claro, stack fiable y feedback corto.\n\nEn Bestcrea recomendamos Next.js App Router, Prisma y billing Stripe desde el MVP.\n\nLuego: observabilidad, onboarding e iteraciones guiadas por datos.",
      "Erfolgreiches SaaS beginnt mit klarem Framing, reliablem Stack und kurzer Feedback-Schleife.\n\nBei Bestcrea empfehlen wir Next.js App Router, Prisma und Stripe Billing ab MVP.\n\nDanach: Observability, Onboarding und datengetriebene Iterationen."
    ),
  },
  {
    slug: "automatiser-les-leads-avec-n8n",
    tags: ["automation", "n8n", "leads"],
    title: L(
      "Automatiser la qualification des leads avec n8n",
      "Automate lead qualification with n8n",
      "أتمتة تأهيل العملاء المحتملين مع n8n",
      "Automatizar la cualificación de leads con n8n",
      "Lead-Qualifizierung mit n8n automatisieren"
    ),
    excerpt: L(
      "Comment connecter formulaires, CRM et relances sans friction.",
      "How to connect forms, CRM and follow-ups without friction.",
      "كيف تربط النماذج وCRM والمتابعات بلا احتكاك.",
      "Cómo conectar formularios, CRM y follow-ups sin fricción.",
      "Formulare, CRM und Follow-ups reibungslos verbinden."
    ),
    content: L(
      "Les leads meurent souvent dans des process manuels.\n\nn8n permet de qualifier, router et relancer automatiquement tout en gardant un humain dans la boucle.\n\nRésultat : plus de vitesse, moins de perte, meilleure conversion.",
      "Leads often die in manual processes.\n\nn8n helps qualify, route and follow up automatically while keeping a human in the loop.\n\nResult: more speed, less leakage, better conversion.",
      "غالباً تضيع العملاء المحتملون في عمليات يدوية.\n\nيمكّن n8n من التأهيل والتوجيه والمتابعة تلقائياً مع بقاء الإنسان في الحلقة.\n\nالنتيجة: سرعة أعلى وتسرّب أقل وتحويل أفضل.",
      "Los leads suelen morir en procesos manuales.\n\nn8n permite cualificar, rutar y hacer follow-up automáticamente manteniendo un humano en el loop.\n\nResultado: más velocidad, menos fuga, mejor conversión.",
      "Leads sterben oft in manuellen Prozessen.\n\nn8n qualifiziert, routet und folgt automatisch nach — mit Human-in-the-Loop.\n\nErgebnis: mehr Tempo, weniger Leakage, bessere Conversion."
    ),
  },
];

async function main() {
  await prisma.pricingPlan.updateMany({
    where: { slug: { in: ["basic", "pro", "premium"] } },
    data: { isActive: false },
  });

  for (const plan of plans) {
    await prisma.pricingPlan.upsert({
      where: { slug: plan.slug },
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        features: plan.features,
        price: plan.price,
        originalPrice: plan.originalPrice,
        discountAmount: plan.discountAmount,
        ctaLabel: plan.ctaLabel,
        currency: "DH",
        billingPeriod: "project",
        isFeatured: plan.isFeatured,
        isActive: true,
        sortOrder: plan.sortOrder,
      },
      update: {
        name: plan.name,
        description: plan.description,
        features: plan.features,
        price: plan.price,
        originalPrice: plan.originalPrice,
        discountAmount: plan.discountAmount,
        ctaLabel: plan.ctaLabel,
        currency: "DH",
        isFeatured: plan.isFeatured,
        isActive: true,
        sortOrder: plan.sortOrder,
      },
    });
  }

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: {
        slug: service.slug,
        title: service.title,
        excerpt: service.excerpt,
        description: service.description,
        features: service.features,
        icon: service.icon,
        isActive: true,
        sortOrder: service.sortOrder,
      },
      update: {
        title: service.title,
        excerpt: service.excerpt,
        description: service.description,
        features: service.features,
        icon: service.icon,
        isActive: true,
        sortOrder: service.sortOrder,
      },
    });
  }

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        isPublished: true,
        publishedAt: new Date(),
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  const clientPasswordHash = await bcrypt.hash(CLIENT_PASSWORD, 12);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const client = await prisma.user.upsert({
    where: { email: CLIENT_EMAIL },
    create: {
      email: CLIENT_EMAIL,
      name: "Client Demo",
      passwordHash: clientPasswordHash,
      role: "client",
      company: "Demo Corp",
      phone: "+212600000001",
      locale: "fr",
      firstName: "Client",
      lastName: "Demo",
      address: "12 Avenue Hassan II",
      city: "Khemisset",
      legalStatus: "sarl",
    },
    update: {
      passwordHash: clientPasswordHash,
      role: "client",
      name: "Client Demo",
      company: "Demo Corp",
    },
  });

  // Backfill unique internal client IDs (CL-000001 …) for every client that lacks one.
  const clientsWithoutCode = await prisma.user.findMany({
    where: { role: "client", clientCode: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  for (const row of clientsWithoutCode) {
    const seq = await prisma.documentSequence.upsert({
      where: { key: "CL" },
      create: { key: "CL", lastValue: 1 },
      update: { lastValue: { increment: 1 } },
    });
    await prisma.user.update({
      where: { id: row.id },
      data: { clientCode: `CL-${String(seq.lastValue).padStart(6, "0")}` },
    });
  }

  // RBAC: seed default permissions per staff role (admin is implicit "all").
  // Existing DB rows are left untouched so permissions edited from the admin UI survive re-seeding.
  for (const role of STAFF_ROLES) {
    if (role === "admin") continue;
    await prisma.rolePermission.upsert({
      where: { role },
      create: { role, permissions: DEFAULT_ROLE_PERMISSIONS[role] },
      update: {},
    });
  }

  // Languages
  const languages = [
    { code: "fr", name: "French", nativeName: "Français", isDefault: true, isRtl: false, sortOrder: 1 },
    { code: "en", name: "English", nativeName: "English", isDefault: false, isRtl: false, sortOrder: 2 },
    { code: "ar", name: "Arabic", nativeName: "العربية", isDefault: false, isRtl: true, sortOrder: 3 },
    { code: "es", name: "Spanish", nativeName: "Español", isDefault: false, isRtl: false, sortOrder: 4 },
    { code: "de", name: "German", nativeName: "Deutsch", isDefault: false, isRtl: false, sortOrder: 5 },
  ];
  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      create: lang,
      update: { name: lang.name, nativeName: lang.nativeName, isRtl: lang.isRtl },
    });
  }

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      name: "Admin Bestcrea",
      passwordHash: adminPasswordHash,
      role: "admin",
      locale: "fr",
    },
    update: {
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  const saasService = await prisma.service.findUnique({
    where: { slug: "saas" },
  });

  const project = await prisma.project.upsert({
    where: { slug: "saas-mvp-demo" },
    create: {
      slug: "saas-mvp-demo",
      title: L(
        "SaaS MVP Demo",
        "SaaS MVP Demo",
        "عرض SaaS MVP",
        "SaaS MVP Demo",
        "SaaS MVP Demo"
      ),
      description: L(
        "Produit SaaS multi-tenant en cours de livraison pour le compte client de démonstration.",
        "Multi-tenant SaaS product currently being delivered for the demo client account.",
        "منتج SaaS متعدد المستأجرين قيد التسليم لحساب العميل التجريبي.",
        "Producto SaaS multi-tenant en entrega para la cuenta demo.",
        "Multi-Tenant-SaaS-Produkt in Auslieferung für das Demo-Konto."
      ),
      status: "active",
      progress: 65,
      milestones: [
        {
          id: "m1",
          title: "Discovery & UX",
          status: "done",
          dueDate: "2026-06-01",
        },
        {
          id: "m2",
          title: "MVP Build",
          status: "in_progress",
          dueDate: "2026-08-15",
        },
        {
          id: "m3",
          title: "Go-live",
          status: "pending",
          dueDate: "2026-09-30",
        },
      ],
      startDate: new Date("2026-05-01"),
      clientId: client.id,
      serviceId: saasService?.id,
    },
    update: {
      status: "active",
      progress: 65,
      milestones: [
        {
          id: "m1",
          title: "Discovery & UX",
          status: "done",
          dueDate: "2026-06-01",
        },
        {
          id: "m2",
          title: "MVP Build",
          status: "in_progress",
          dueDate: "2026-08-15",
        },
        {
          id: "m3",
          title: "Go-live",
          status: "pending",
          dueDate: "2026-09-30",
        },
      ],
      clientId: client.id,
      serviceId: saasService?.id,
    },
  });

  await prisma.invoice.upsert({
    where: { reference: "INV-DEMO-001" },
    create: {
      reference: "INV-DEMO-001",
      title: "Acompte SaaS MVP — 50%",
      description: "Acompte à la signature du projet SaaS MVP Demo.",
      amount: 2500,
      taxAmount: 500,
      totalAmount: 3000,
      currency: "EUR",
      status: "sent",
      issuedAt: new Date("2026-06-15"),
      dueAt: new Date("2026-07-15"),
      userId: client.id,
      projectId: project.id,
      items: [{ label: "Acompte 50%", amount: 2500, tax: 500 }],
      notes: "Paiement par virement sous 30 jours.",
    },
    update: {
      title: "Acompte SaaS MVP — 50%",
      amount: 2500,
      taxAmount: 500,
      totalAmount: 3000,
      status: "sent",
      userId: client.id,
      projectId: project.id,
    },
  });

  const existingTicket = await prisma.supportTicket.findFirst({
    where: { reference: "TKT-DEMO-001" },
  });

  if (!existingTicket) {
    await prisma.supportTicket.create({
      data: {
        reference: "TKT-DEMO-001",
        subject: "Question sur le jalon MVP Build",
        description:
          "Bonjour, pouvez-vous confirmer la date de livraison du jalon MVP Build ?",
        status: "open",
        priority: "medium",
        locale: "fr",
        requesterId: client.id,
        messages: [
          {
            from: "client",
            body: "Bonjour, pouvez-vous confirmer la date de livraison du jalon MVP Build ?",
            at: new Date().toISOString(),
          },
        ],
      },
    });
  }

  const partners = [
    { name: "Hostinger", logo: "/images/partners/hostinger.webp", website: "https://www.hostinger.com", sortOrder: 1 },
    { name: "Vercel", logo: "/images/partners/vercel.webp", website: "https://vercel.com", sortOrder: 2 },
    { name: "Cloudflare", logo: "/images/partners/cloudflare.webp", website: "https://www.cloudflare.com", sortOrder: 3 },
    { name: "AWS", logo: "/images/partners/aws.webp", website: "https://aws.amazon.com", sortOrder: 4 },
    { name: "Google Cloud", logo: "/images/partners/google-cloud.webp", website: "https://cloud.google.com", sortOrder: 5 },
    { name: "Microsoft", logo: "/images/partners/microsoft.webp", website: "https://www.microsoft.com", sortOrder: 6 },
    { name: "Apple", logo: "/images/partners/apple.webp", website: "https://www.apple.com", sortOrder: 7 },
    { name: "Meta", logo: "/images/partners/meta.webp", website: "https://www.meta.com", sortOrder: 8 },
    { name: "Anthropic", logo: "/images/partners/anthropic.webp", website: "https://www.anthropic.com", sortOrder: 9 },
    { name: "NVIDIA", logo: "/images/partners/nvidia.webp", website: "https://www.nvidia.com", sortOrder: 10 },
    { name: "Intel", logo: "/images/partners/intel.webp", website: "https://www.intel.com", sortOrder: 11 },
    { name: "Dell", logo: "/images/partners/dell.webp", website: "https://www.dell.com", sortOrder: 12 },
    { name: "HP", logo: "/images/partners/hp.webp", website: "https://www.hp.com", sortOrder: 13 },
    { name: "GitHub", logo: "/images/partners/github.webp", website: "https://github.com", sortOrder: 14 },
    { name: "PostgreSQL", logo: "/images/partners/postgresql.webp", website: "https://www.postgresql.org", sortOrder: 15 },
    { name: "MongoDB", logo: "/images/partners/mongodb.webp", website: "https://www.mongodb.com", sortOrder: 16 },
    { name: "Firebase", logo: "/images/partners/firebase.webp", website: "https://firebase.google.com", sortOrder: 17 },
    { name: "Oracle", logo: "/images/partners/oracle.webp", website: "https://www.oracle.com", sortOrder: 18 },
    { name: "WordPress", logo: "/images/partners/wordpress.webp", website: "https://wordpress.org", sortOrder: 19 },
    { name: "Laravel", logo: "/images/partners/laravel.webp", website: "https://laravel.com", sortOrder: 20 },
    { name: "Magento", logo: "/images/partners/magento.webp", website: "https://magento.com", sortOrder: 21 },
    { name: "cPanel", logo: "/images/partners/cpanel.webp", website: "https://cpanel.net", sortOrder: 22 },
    { name: "Plesk", logo: "/images/partners/plesk.webp", website: "https://www.plesk.com", sortOrder: 23 },
    { name: "Webuzo", logo: "/images/partners/webuzo.webp", website: "https://webuzo.com", sortOrder: 24 },
    { name: "PayPal", logo: "/images/partners/paypal.webp", website: "https://www.paypal.com", sortOrder: 25 },
    { name: "Mastercard", logo: "/images/partners/mastercard.webp", website: "https://www.mastercard.com", sortOrder: 26 },
    { name: "Attijariwafa Bank", logo: "/images/partners/attijariwafa-bank.webp", website: null, sortOrder: 27 },
    { name: "CIH Bank", logo: "/images/partners/cih-bank.webp", website: null, sortOrder: 28 },
    { name: "Al Barid Bank", logo: "/images/partners/albarid-bank.webp", website: null, sortOrder: 29 },
    { name: "NindoHost", logo: "/images/partners/nindohost.webp", website: null, sortOrder: 30 },
    { name: "INDH", logo: "/images/partners/indh.webp", website: null, sortOrder: 31 },
  ];

  await prisma.partner.deleteMany({});
  await prisma.partner.createMany({ data: partners });

  console.log(
    `Seeded ${plans.length} plans, ${services.length} services, ${blogPosts.length} blog posts, ${partners.length} partners, client portal demo (${CLIENT_EMAIL} / ${CLIENT_PASSWORD}).`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
