/**
 * Role-Based Access Control.
 *
 * Permission keys are "<resource>.<action>". Default permissions per role live in
 * DEFAULT_ROLE_PERMISSIONS and are seeded into the RolePermission table, where the
 * administrator can then edit them (Administration → Roles & Permissions).
 * The `admin` role always has every permission and cannot be restricted.
 */

export const STAFF_ROLES = [
  "admin",
  "director",
  "gerant",
  "manager",
  "collaborateur",
  "editor",
  "prestataire",
  "assistant",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  director: "Directeur Administrateur",
  gerant: "Gérant",
  manager: "Manager",
  collaborateur: "Collaborateur",
  editor: "Éditeur",
  prestataire: "Prestataire",
  assistant: "Assistant / Assistante",
  client: "Client",
};

export const PERMISSION_GROUPS = {
  clients: ["clients.view", "clients.create", "clients.edit", "clients.delete", "clients.suspend", "clients.impersonate"],
  quotes: ["quotes.view", "quotes.create", "quotes.edit", "quotes.delete", "quotes.send"],
  purchaseOrders: ["purchase_orders.view", "purchase_orders.create", "purchase_orders.edit", "purchase_orders.delete"],
  deliveryNotes: ["delivery_notes.view", "delivery_notes.create", "delivery_notes.edit", "delivery_notes.delete"],
  invoices: ["invoices.view", "invoices.create", "invoices.edit", "invoices.delete", "invoices.record_payment"],
  orders: ["orders.view", "orders.manage", "payments.verify"],
  catalogue: ["products.manage", "services.manage", "pricing.manage", "packs.manage", "coupons.manage"],
  website: ["pages.manage", "menus.manage", "languages.manage", "header.manage", "footer.manage", "portfolio.manage"],
  communication: ["ai.view", "notifications.manage", "messages.view"],
  administration: ["users.manage", "roles.manage", "settings.manage", "audit.view", "dashboard.view"],
} as const;

export const ALL_PERMISSIONS: string[] = Object.values(PERMISSION_GROUPS).flat();

const view = (...groups: (keyof typeof PERMISSION_GROUPS)[]) =>
  groups.flatMap((g) => PERMISSION_GROUPS[g].filter((p) => p.endsWith(".view")));

export const DEFAULT_ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  admin: ALL_PERMISSIONS,
  director: ALL_PERMISSIONS.filter((p) => p !== "roles.manage" && p !== "clients.impersonate"),
  gerant: ALL_PERMISSIONS.filter(
    (p) => !["roles.manage", "users.manage", "settings.manage", "clients.impersonate", "clients.delete"].includes(p)
  ),
  manager: [
    "dashboard.view",
    ...PERMISSION_GROUPS.clients.filter((p) => !["clients.delete", "clients.impersonate"].includes(p)),
    ...PERMISSION_GROUPS.quotes,
    ...PERMISSION_GROUPS.purchaseOrders,
    ...PERMISSION_GROUPS.deliveryNotes,
    ...PERMISSION_GROUPS.invoices.filter((p) => p !== "invoices.delete"),
    ...PERMISSION_GROUPS.orders,
    "ai.view",
    "messages.view",
    "notifications.manage",
  ],
  collaborateur: [
    "dashboard.view",
    ...view("clients", "quotes", "purchaseOrders", "deliveryNotes", "invoices", "orders"),
    "quotes.create",
    "quotes.edit",
    "delivery_notes.create",
    "delivery_notes.edit",
    "messages.view",
  ],
  editor: [
    "dashboard.view",
    "pages.manage",
    "menus.manage",
    "portfolio.manage",
    "services.manage",
    "products.manage",
    "header.manage",
    "footer.manage",
  ],
  prestataire: ["orders.view", "delivery_notes.view", "delivery_notes.create", "messages.view"],
  assistant: [
    "dashboard.view",
    ...view("clients", "quotes", "orders"),
    "messages.view",
    "ai.view",
    "clients.create",
    "clients.edit",
  ],
};

export function isStaffRole(role?: string | null): role is StaffRole {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}

export function isValidPermission(key: string) {
  return ALL_PERMISSIONS.includes(key);
}

/** Pure check against an explicit permission list (admin always passes). */
export function hasPermission(role: string | null | undefined, permissions: string[], needed: string) {
  if (role === "admin") return true;
  return permissions.includes(needed);
}
