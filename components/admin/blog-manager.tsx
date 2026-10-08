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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pickLocale } from "@/lib/i18n-content";

export type AdminPost = {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string> | null;
  content: Record<string, string>;
  tags: string[];
  isPublished: boolean;
};

export function BlogManager({ posts, locale }: { posts: AdminPost[]; locale: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPost | null>(null);
  const [form, setForm] = useState({
    titleFr: "",
    slug: "",
    excerptFr: "",
    contentFr: "",
    tags: "",
    isPublished: false,
  });

  function openCreate() {
    setEditing(null);
    setForm({
      titleFr: "",
      slug: "",
      excerptFr: "",
      contentFr: "",
      tags: "",
      isPublished: false,
    });
    setOpen(true);
  }

  function openEdit(post: AdminPost) {
    setEditing(post);
    setForm({
      titleFr: pickLocale(post.title as never, "fr"),
      slug: post.slug,
      excerptFr: pickLocale(post.excerpt as never, "fr"),
      contentFr: pickLocale(post.content as never, "fr"),
      tags: post.tags.join(", "),
      isPublished: post.isPublished,
    });
    setOpen(true);
  }

  async function save() {
    const payload = {
      id: editing?.id,
      slug: form.slug || undefined,
      title: { fr: form.titleFr, en: form.titleFr, ar: form.titleFr, es: form.titleFr, de: form.titleFr },
      excerpt: {
        fr: form.excerptFr,
        en: form.excerptFr,
        ar: form.excerptFr,
        es: form.excerptFr,
        de: form.excerptFr,
      },
      content: {
        fr: form.contentFr,
        en: form.contentFr,
        ar: form.contentFr,
        es: form.contentFr,
        de: form.contentFr,
      },
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isPublished: form.isPublished,
    };

    const response = await fetch("/api/admin/blog", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      alert("Erreur sauvegarde");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet article ?")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={openCreate}>
          Nouvel article
        </Button>
      </div>
      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Slug / SEO</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">
                  {pickLocale(post.title as never, locale)}
                </TableCell>
                <TableCell>
                  <p className="font-mono text-xs">{post.slug}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {pickLocale(post.excerpt as never, locale)}
                  </p>
                </TableCell>
                <TableCell className="text-xs">{post.tags.join(", ") || "—"}</TableCell>
                <TableCell>
                  <Badge variant={post.isPublished ? "success" : "secondary"}>
                    {post.isPublished ? "Publié" : "Brouillon"}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => openEdit(post)}>
                    Éditer
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(post.id)}>
                    Suppr.
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Éditer l'article" : "Nouvel article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Titre (SEO H1)</Label>
              <Input
                value={form.titleFr}
                onChange={(e) => setForm((f) => ({ ...f, titleFr: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Meta description (excerpt)</Label>
              <Textarea
                value={form.excerptFr}
                onChange={(e) => setForm((f) => ({ ...f, excerptFr: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Contenu</Label>
              <Textarea
                rows={8}
                value={form.contentFr}
                onChange={(e) => setForm((f) => ({ ...f, contentFr: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (virgules)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              />
              Publié
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button variant="accent" onClick={save} disabled={!form.titleFr}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
