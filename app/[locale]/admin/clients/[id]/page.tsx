import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { roleCan } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { dateFmt, dateTimeFmt, money } from "@/lib/format";
import { LEGAL_STATUS_LABELS } from "@/lib/validators";
import { StatusBadge } from "@/components/admin/status-badge";
import { ClientActions, ClientEditForm } from "@/components/admin/client-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = { params: Promise<{ locale: string; id: string }> };

const LIMIT = 50;

export default async function AdminClientDetailPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requirePermission("clients.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const client = await prisma.user.findFirst({ where: { id: params.id, role: "client" } });
  if (!client) notFound();

  const role = session.user.role;
  const [orders, quotes, invoices, payments, purchaseOrders, deliveryNotes, logs, revenue, can] = await Promise.all([
    prisma.order.findMany({ where: { userId: client.id }, orderBy: { createdAt: "desc" }, take: LIMIT }),
    prisma.quote.findMany({ where: { userId: client.id }, orderBy: { createdAt: "desc" }, take: LIMIT }),
    prisma.invoice.findMany({ where: { userId: client.id }, orderBy: { createdAt: "desc" }, take: LIMIT }),
    prisma.payment.findMany({
      where: { order: { userId: client.id } },
      include: { order: { select: { number: true } } },
      orderBy: { createdAt: "desc" },
      take: LIMIT,
    }),
    prisma.purchaseOrder.findMany({ where: { userId: client.id }, orderBy: { createdAt: "desc" }, take: LIMIT }),
    prisma.deliveryNote.findMany({ where: { userId: client.id }, orderBy: { createdAt: "desc" }, take: LIMIT }),
    prisma.auditLog.findMany({
      where: { entity: "User", entityId: client.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: LIMIT,
    }),
    prisma.order.aggregate({
      where: { userId: client.id, paymentStatus: "confirmed" },
      _sum: { total: true },
      _count: { _all: true },
    }),
    Promise.all([
      roleCan(role, "clients.edit"),
      roleCan(role, "clients.suspend"),
      roleCan(role, "clients.delete"),
      roleCan(role, "messages.view"),
    ]),
  ]);

  const [canEdit, canSuspend, canDelete, canMessage] = can;
  const clientData = {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    address: client.address,
    city: client.city,
    company: client.company,
    ice: client.ice,
    rc: client.rc,
    legalStatus: client.legalStatus,
    accountStatus: client.accountStatus,
  } as const;

  const kpis = [
    { label: "Commandes", value: String(orders.length) },
    { label: "CA confirmé (DH)", value: money(revenue._sum.total ?? 0) },
    { label: "Devis", value: String(quotes.length) },
    { label: "Factures", value: String(invoices.length) },
  ];

  const empty = (n: number) =>
    n === 0 ? <p className="p-6 text-sm text-muted-foreground">Aucun élément.</p> : null;

  return (
    <div className="space-y-6">
      <Link href="/admin/clients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Clients
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{client.name || client.email}</h1>
            <StatusBadge status={client.accountStatus} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{client.clientCode ?? "—"}</span> · {client.email}
            {client.legalStatus ? ` · ${LEGAL_STATUS_LABELS[client.legalStatus]}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Inscrit le {dateFmt(client.createdAt)} · Dernière activité {dateTimeFmt(client.lastActivityAt)}
          </p>
        </div>
        <ClientActions
          client={clientData}
          can={{ edit: canEdit, suspend: canSuspend, delete: canDelete, message: canMessage }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border bg-white p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{k.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="orders">Commandes ({orders.length})</TabsTrigger>
          <TabsTrigger value="quotes">Devis ({quotes.length})</TabsTrigger>
          <TabsTrigger value="invoices">Factures ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Paiements ({payments.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({purchaseOrders.length + deliveryNotes.length})</TabsTrigger>
          <TabsTrigger value="activity">Activité ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-xl border bg-white p-5">
            <ClientEditForm client={clientData} canEdit={canEdit} />
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="overflow-x-auto rounded-xl border bg-white">
            {empty(orders.length)}
            {orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.number}</TableCell>
                      <TableCell>{dateFmt(o.createdAt)}</TableCell>
                      <TableCell>{money(o.total)} {o.currency}</TableCell>
                      <TableCell><StatusBadge status={o.paymentStatus} /></TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="quotes">
          <div className="overflow-x-auto rounded-xl border bg-white">
            {empty(quotes.length)}
            {quotes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Total TTC</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-xs">{q.reference}</TableCell>
                      <TableCell>{q.title}</TableCell>
                      <TableCell>{money(q.total)} {q.currency}</TableCell>
                      <TableCell><StatusBadge status={q.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="overflow-x-auto rounded-xl border bg-white">
            {empty(invoices.length)}
            {invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Total TTC</TableHead>
                    <TableHead>Payé</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.reference}</TableCell>
                      <TableCell>{dateFmt(i.dueAt)}</TableCell>
                      <TableCell>{money(i.totalAmount)} {i.currency}</TableCell>
                      <TableCell>{money(i.paidTotal)}</TableCell>
                      <TableCell><StatusBadge status={i.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="overflow-x-auto rounded-xl border bg-white">
            {empty(payments.length)}
            {payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.order.number}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell>{p.reference || "—"}</TableCell>
                      <TableCell>{money(p.amount)} {p.currency}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-xl border bg-white">
              <p className="border-b px-4 py-2 text-sm font-medium">Bons de commande</p>
              {empty(purchaseOrders.length)}
              {purchaseOrders.map((d) => (
                <div key={d.id} className="flex items-center justify-between border-b px-4 py-2 text-sm last:border-0">
                  <span className="font-mono text-xs">{d.number}</span>
                  <span>{money(d.total)} {d.currency}</span>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border bg-white">
              <p className="border-b px-4 py-2 text-sm font-medium">Bons de livraison</p>
              {empty(deliveryNotes.length)}
              {deliveryNotes.map((d) => (
                <div key={d.id} className="flex items-center justify-between border-b px-4 py-2 text-sm last:border-0">
                  <span className="font-mono text-xs">{d.number}</span>
                  <span>{dateFmt(d.issueDate)}</span>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-xl border bg-white">
            {empty(logs.length)}
            <ul className="divide-y">
              {logs.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                  <span className="font-mono text-xs">{l.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {l.user?.name || l.user?.email || "Système"} · {dateTimeFmt(l.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
