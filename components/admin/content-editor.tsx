"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pickLocale } from "@/lib/i18n-content";

const LOCALES = ["fr", "en", "ar", "es", "de"] as const;

export type PageRow = {
  id: string;
  key: string;
  title: Record<string, string>;
  seoDescription: Record<string, string> | null;
  content: Record<string, unknown>;
  isPublished: boolean;
};

export function ContentEditor({ pages }: { pages: PageRow[] }) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState(pages[0]?.key || "home");
  const selected = pages.find((p) => p.key === selectedKey);
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("fr");
  const [title, setTitle] = useState("");
  const [seo, setSeo] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function load(page: PageRow, loc: (typeof LOCALES)[number]) {
    setSelectedKey(page.key);
    setLocale(loc);
    setTitle(pickLocale(page.title as never, loc));
    setSeo(pickLocale((page.seoDescription || {}) as never, loc));
    const content = page.content?.[loc];
    setBody(typeof content === "string" ? content : JSON.stringify(content ?? {}, null, 2));
  }

  async function save() {
    const page = pages.find((p) => p.key === selectedKey) || {
      key: selectedKey,
      title: {},
      seoDescription: {},
      content: {},
      isPublished: true,
    };

    const nextTitle = { ...(page.title || {}), [locale]: title };
    const nextSeo = { ...((page.seoDescription as object) || {}), [locale]: seo };
    let parsedBody: unknown = body;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      parsedBody = body;
    }
    const nextContent = { ...(page.content || {}), [locale]: parsedBody };

    const response = await fetch("/api/admin/page-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: selectedKey,
        title: nextTitle,
        seoDescription: nextSeo,
        content: nextContent,
        isPublished: true,
      }),
    });

    if (!response.ok) {
      setMessage("Erreur de sauvegarde");
      return;
    }
    setMessage("Contenu enregistré");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sm">Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(pages.length ? pages : [{ key: "home" } as PageRow]).map((page) => (
            <Button
              key={page.key}
              variant={selectedKey === page.key ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => load(page.key === selectedKey && selected ? selected : (pages.find((p) => p.key === page.key) || { id: "", key: page.key, title: {}, seoDescription: {}, content: {}, isPublished: true }), locale)}
            >
              {page.key}
            </Button>
          ))}
          <div className="pt-2">
            <Label>Nouvelle clé</Label>
            <Input
              className="mt-1"
              placeholder="ex: about"
              onBlur={(e) => {
                if (e.target.value.trim()) setSelectedKey(e.target.value.trim());
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Édition · {selectedKey}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={locale}
            onValueChange={(v) => {
              const loc = v as (typeof LOCALES)[number];
              if (selected) load(selected, loc);
              else setLocale(loc);
            }}
          >
            <TabsList>
              {LOCALES.map((l) => (
                <TabsTrigger key={l} value={l}>
                  {l.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={locale} className="space-y-3">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>SEO description</Label>
                <Textarea value={seo} onChange={(e) => setSeo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contenu (texte ou JSON)</Label>
                <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex items-center gap-3">
            <Button variant="accent" onClick={save}>
              Enregistrer
            </Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
