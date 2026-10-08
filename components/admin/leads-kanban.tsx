"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLUMNS = [
  { key: "new", label: "Nouveaux" },
  { key: "contacted", label: "Contactés" },
  { key: "qualified", label: "Qualifiés" },
  { key: "converted", label: "Convertis" },
  { key: "lost", label: "Perdus" },
] as const;

export type AdminLead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
  source: string | null;
  message: string | null;
  createdAt: string;
};

export function LeadsKanban({ leads }: { leads: AdminLead[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const byStatus = useMemo(() => {
    const map: Record<string, AdminLead[]> = {};
    for (const col of COLUMNS) map[col.key] = [];
    for (const lead of leads) {
      (map[lead.status] || map.new).push(lead);
    }
    return map;
  }, [leads]);

  async function move(id: string, status: string) {
    setBusy(id);
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild variant="outline">
          <a href="/api/admin/leads/export">Export CSV</a>
        </Button>
      </div>
      <div className="grid gap-4 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2">
        {COLUMNS.map((col) => (
          <Card key={col.key} className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                {col.label}
                <Badge variant="secondary">{byStatus[col.key]?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(byStatus[col.key] || []).map((lead) => (
                <div key={lead.id} className="rounded-lg border border-primary/10 p-3 text-sm">
                  <p className="font-semibold text-primary">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.email}</p>
                  {lead.company ? (
                    <p className="mt-1 text-xs text-muted-foreground">{lead.company}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {COLUMNS.filter((c) => c.key !== lead.status).map((c) => (
                      <Button
                        key={c.key}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[10px]"
                        disabled={busy === lead.id}
                        onClick={() => move(lead.id, c.key)}
                      >
                        → {c.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
