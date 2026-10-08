"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pickLocale } from "@/lib/i18n-content";

type Partner = {
  id: string;
  name: string;
  website: string | null;
  sortOrder: number;
  isActive: boolean;
};

type Testimonial = {
  id: string;
  authorName: string;
  company: string | null;
  content: Record<string, string>;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
};

export function PartnersTestimonialsManager({
  partners,
  testimonials,
  locale,
}: {
  partners: Partner[];
  testimonials: Testimonial[];
  locale: string;
}) {
  const router = useRouter();
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    website: "",
    sortOrder: "0",
  });
  const [testiOpen, setTestiOpen] = useState(false);
  const [testiForm, setTestiForm] = useState({
    authorName: "",
    company: "",
    contentFr: "",
    sortOrder: "0",
  });

  async function savePartner() {
    await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "partner",
        name: partnerForm.name,
        website: partnerForm.website || null,
        sortOrder: Number(partnerForm.sortOrder || 0),
      }),
    });
    setPartnerOpen(false);
    router.refresh();
  }

  async function saveTestimonial() {
    await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "testimonial",
        authorName: testiForm.authorName,
        company: testiForm.company || null,
        content: {
          fr: testiForm.contentFr,
          en: testiForm.contentFr,
          ar: testiForm.contentFr,
          es: testiForm.contentFr,
          de: testiForm.contentFr,
        },
        sortOrder: Number(testiForm.sortOrder || 0),
      }),
    });
    setTestiOpen(false);
    router.refresh();
  }

  async function move(type: "partner" | "testimonial", id: string, sortOrder: number) {
    await fetch("/api/admin/partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, sortOrder }),
    });
    router.refresh();
  }

  async function remove(type: "partner" | "testimonial", id: string) {
    if (!confirm("Supprimer ?")) return;
    await fetch(`/api/admin/partners?type=${type}&id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Tabs defaultValue="partners">
      <TabsList>
        <TabsTrigger value="partners">Partenaires</TabsTrigger>
        <TabsTrigger value="testimonials">Témoignages</TabsTrigger>
      </TabsList>

      <TabsContent value="partners" className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="accent"
            onClick={() => {
              setPartnerForm({ name: "", website: "", sortOrder: "0" });
              setPartnerOpen(true);
            }}
          >
            Ajouter partenaire
          </Button>
        </div>
        <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-xs">{p.website || "—"}</TableCell>
                  <TableCell>{p.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "success" : "secondary"}>
                      {p.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => move("partner", p.id, p.sortOrder - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => move("partner", p.id, p.sortOrder + 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove("partner", p.id)}
                    >
                      Suppr.
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="testimonials" className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="accent"
            onClick={() => {
              setTestiForm({ authorName: "", company: "", contentFr: "", sortOrder: "0" });
              setTestiOpen(true);
            }}
          >
            Ajouter témoignage
          </Button>
        </div>
        <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auteur</TableHead>
                <TableHead>Contenu</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="font-medium">{t.authorName}</p>
                    <p className="text-xs text-muted-foreground">{t.company}</p>
                  </TableCell>
                  <TableCell className="max-w-sm truncate text-sm">
                    {pickLocale(t.content as never, locale)}
                  </TableCell>
                  <TableCell>{t.sortOrder}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => move("testimonial", t.id, t.sortOrder - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => move("testimonial", t.id, t.sortOrder + 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove("testimonial", t.id)}
                    >
                      Suppr.
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <Dialog open={partnerOpen} onOpenChange={setPartnerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau partenaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={partnerForm.name}
                onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={partnerForm.website}
                onChange={(e) => setPartnerForm((f) => ({ ...f, website: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Ordre</Label>
              <Input
                type="number"
                value={partnerForm.sortOrder}
                onChange={(e) => setPartnerForm((f) => ({ ...f, sortOrder: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="accent" onClick={savePartner} disabled={!partnerForm.name}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={testiOpen} onOpenChange={setTestiOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau témoignage</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Auteur</Label>
              <Input
                value={testiForm.authorName}
                onChange={(e) => setTestiForm((f) => ({ ...f, authorName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Société</Label>
              <Input
                value={testiForm.company}
                onChange={(e) => setTestiForm((f) => ({ ...f, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Contenu</Label>
              <Textarea
                value={testiForm.contentFr}
                onChange={(e) => setTestiForm((f) => ({ ...f, contentFr: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="accent"
              onClick={saveTestimonial}
              disabled={!testiForm.authorName || !testiForm.contentFr}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
