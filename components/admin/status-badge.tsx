import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  // generic
  active: "bg-emerald-100 text-emerald-800",
  suspended: "bg-red-100 text-red-800",
  // documents / orders
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-indigo-100 text-indigo-800",
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800",
  cancelled: "bg-slate-200 text-slate-600",
  unpaid: "bg-amber-100 text-amber-800",
  partially_paid: "bg-yellow-100 text-yellow-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
  awaiting_payment: "bg-amber-100 text-amber-800",
  payment_submitted: "bg-blue-100 text-blue-800",
  payment_confirmed: "bg-emerald-100 text-emerald-800",
  processing: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  refunded: "bg-purple-100 text-purple-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  submitted: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
  delivered: "bg-emerald-100 text-emerald-800",
  new: "bg-blue-100 text-blue-800",
  in_review: "bg-amber-100 text-amber-800",
  quoted: "bg-indigo-100 text-indigo-800",
  closed: "bg-slate-200 text-slate-600",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-slate-200 text-slate-600",
};

const labels: Record<string, string> = {
  active: "Actif",
  suspended: "Suspendu",
  draft: "Brouillon",
  sent: "Envoyé",
  viewed: "Consulté",
  pending: "En attente",
  accepted: "Accepté",
  rejected: "Refusé",
  expired: "Expiré",
  cancelled: "Annulé",
  unpaid: "Impayée",
  partially_paid: "Partiellement payée",
  paid: "Payée",
  overdue: "En retard",
  awaiting_payment: "En attente de paiement",
  payment_submitted: "Paiement soumis",
  payment_confirmed: "Paiement confirmé",
  processing: "En traitement",
  in_progress: "En cours",
  completed: "Terminée",
  refunded: "Remboursée",
  confirmed: "Confirmé",
  submitted: "Soumis",
  failed: "Échoué",
  delivered: "Livré",
  new: "Nouvelle",
  in_review: "En étude",
  quoted: "Devisée",
  closed: "Clôturée",
  published: "Publié",
  archived: "Archivé",
};

export function statusLabel(status: string) {
  return labels[status] ?? status;
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[status] ?? "bg-slate-100 text-slate-700",
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
