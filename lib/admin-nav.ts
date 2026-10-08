export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  /** Permission needed to see the entry (omit = any staff). */
  permission?: string;
  exact?: boolean;
};

export type AdminNavGroup = {
  title: string | null;
  items: AdminNavItem[];
};

/**
 * Admin navigation. Only routes that exist are listed — new modules are appended here
 * as they are delivered so the sidebar never links to a 404.
 */
export const adminNav: AdminNavGroup[] = [
  {
    title: null,
    items: [{ href: "/admin", label: "Dashboard", icon: "dashboard", exact: true, permission: "dashboard.view" }],
  },
  {
    title: "Outils",
    items: [
      { href: "/admin/clients", label: "Clients", icon: "users", permission: "clients.view" },
      { href: "/admin/facturation", label: "Facturation", icon: "receipt", permission: "invoices.view" },
      { href: "/admin/devis", label: "Devis", icon: "filetext", permission: "quotes.view" },
      { href: "/admin/bons-de-commande", label: "Bons de commande", icon: "clipboard", permission: "purchase_orders.view" },
      { href: "/admin/bons-de-livraison", label: "Bons de livraison", icon: "truck", permission: "delivery_notes.view" },
      { href: "/admin/leads", label: "Leads & Demandes", icon: "kanban", permission: "quotes.view" },
    ],
  },
  {
    title: "Catalogue",
    items: [{ href: "/admin/services", label: "Services & Pricing", icon: "layers", permission: "services.manage" }],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/contenu", label: "Pages & Contenu", icon: "file", permission: "pages.manage" },
      { href: "/admin/blog", label: "Blog / Ressources", icon: "news", permission: "pages.manage" },
      { href: "/admin/partenaires", label: "Partenaires & Témoignages", icon: "handshake", permission: "pages.manage" },
      { href: "/admin/multilingue", label: "Multilingue", icon: "languages", permission: "languages.manage" },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/comptes", label: "Comptes", icon: "shield", permission: "users.manage" },
      { href: "/admin/roles", label: "Rôles & Permissions", icon: "key", permission: "roles.manage" },
      { href: "/admin/audit", label: "Journal d'audit", icon: "history", permission: "audit.view" },
      { href: "/admin/parametres", label: "Paramètres", icon: "settings", permission: "settings.manage" },
    ],
  },
];
