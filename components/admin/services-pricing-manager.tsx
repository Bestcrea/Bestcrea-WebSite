"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pickLocale } from "@/lib/i18n-content";

export type AdminService = {
  id: string;
  slug: string;
  title: Record<string, string> | string;
  excerpt: Record<string, string> | string | null;
  description: Record<string, string> | string | null;
  isActive: boolean;
  sortOrder: number;
  icon: string | null;
};

export type AdminPlan = {
  id: string;
  slug: string;
  name: Record<string, string> | string;
  price: string | number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type Props = {
  services: AdminService[];
  plans: AdminPlan[];
  locale: string;
};

const emptyService = {
  slug: "",
  titleFr: "",
  excerptFr: "",
  descriptionFr: "",
  icon: "",
  sortOrder: "0",
  isActive: true,
};

export function ServicesPricingManager({ services, plans, locale }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [form, setForm] = useState(emptyService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...services].sort((a, b) => a.sortOrder - b.sortOrder),
    [services]
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyService);
    setError(null);
    setOpen(true);
  }

  function openEdit(service: AdminService) {
    setEditing(service);
    setForm({
      slug: service.slug,
      titleFr: pickLocale(service.title as never, "fr"),
      excerptFr: pickLocale(service.excerpt as never, "fr"),
      descriptionFr: pickLocale(service.description as never, "fr"),
      icon: service.icon || "",
      sortOrder: String(service.sortOrder),
      isActive: service.isActive,
    });
    setError(null);
    setOpen(true);
  }

  async function save() {
    setLoading(true);
    setError(null);
    const payload = {
      slug: form.slug || undefined,
      title: {
        fr: form.titleFr,
        en: form.titleFr,
        ar: form.titleFr,
        es: form.titleFr,
        de: form.titleFr,
      },
      excerpt: {
        fr: form.excerptFr,
        en: form.excerptFr,
        ar: form.excerptFr,
        es: form.excerptFr,
        de: form.excerptFr,
      },
      description: {
        fr: form.descriptionFr,
        en: form.descriptionFr,
        ar: form.descriptionFr,
        es: form.descriptionFr,
        de: form.descriptionFr,
      },
      icon: form.icon || null,
      sortOrder: Number(form.sortOrder || 0),
      isActive: form.isActive,
    };

    try {
      const response = await fetch(
        editing ? `/api/admin/services/${editing.id}` : "/api/admin/services",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Erreur");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce service ?")) return;
    const response = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      alert(data?.error || "Suppression impossible");
      return;
    }
    router.refresh();
  }

  return (
    <Tabs defaultValue="services">
      <TabsList>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
      </TabsList>

      <TabsContent value="services" className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{sorted.length} service(s)</p>
          <Button variant="accent" onClick={openCreate}>
            Nouveau service
          </Button>
        </div>
        <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">
                    {pickLocale(service.title as never, locale)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{service.slug}</TableCell>
                  <TableCell>{service.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? "success" : "secondary"}>
                      {service.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(service)}>
                      Éditer
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(service.id)}>
                      Suppr.
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="pricing">
        <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    {pickLocale(plan.name as never, locale)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{plan.slug}</TableCell>
                  <TableCell>
                    {Number(plan.price).toFixed(0)} {plan.currency}
                  </TableCell>
                  <TableCell>{plan.isFeatured ? "Oui" : "Non"}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "success" : "secondary"}>
                      {plan.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Les plans pricing sont seedés ; l’édition fine pourra être étendue comme les services.
        </p>
      </TabsContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Éditer le service" : "Nouveau service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Titre (FR)</Label>
              <Input
                value={form.titleFr}
                onChange={(e) => setForm((f) => ({ ...f, titleFr: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto si vide"
              />
            </div>
            <div className="space-y-2">
              <Label>Excerpt (FR)</Label>
              <Textarea
                value={form.excerptFr}
                onChange={(e) => setForm((f) => ({ ...f, excerptFr: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (FR)</Label>
              <Textarea
                rows={5}
                value={form.descriptionFr}
                onChange={(e) => setForm((f) => ({ ...f, descriptionFr: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Icône</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Actif
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button variant="accent" onClick={save} disabled={loading || !form.titleFr}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
