"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Settings = {
  seo: {
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    from: string;
  };
  apiKeys: {
    openai: string;
    maps: string;
    analytics: string;
  };
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setLoading(false);
    if (!response.ok) {
      setMessage("Erreur de sauvegarde");
      return;
    }
    setMessage("Paramètres enregistrés");
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="seo">
        <TabsList>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="api">Clés API</TabsTrigger>
          <TabsTrigger value="colors">Couleurs</TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base">SEO global</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field
                label="Nom du site"
                value={settings.seo.siteName}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, seo: { ...s.seo, siteName: v } }))
                }
              />
              <Field
                label="Title par défaut"
                value={settings.seo.defaultTitle}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, seo: { ...s.seo, defaultTitle: v } }))
                }
              />
              <div className="space-y-2">
                <Label>Meta description</Label>
                <Textarea
                  value={settings.seo.defaultDescription}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      seo: { ...s.seo, defaultDescription: e.target.value },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smtp">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base">SMTP</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Host"
                value={settings.smtp.host}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, smtp: { ...s.smtp, host: v } }))
                }
              />
              <Field
                label="Port"
                value={String(settings.smtp.port)}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    smtp: { ...s.smtp, port: Number(v) || 587 },
                  }))
                }
              />
              <Field
                label="User"
                value={settings.smtp.user}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, smtp: { ...s.smtp, user: v } }))
                }
              />
              <Field
                label="From"
                value={settings.smtp.from}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, smtp: { ...s.smtp, from: v } }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base">Clés API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field
                label="OpenAI"
                value={settings.apiKeys.openai}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    apiKeys: { ...s.apiKeys, openai: v },
                  }))
                }
              />
              <Field
                label="Google Maps"
                value={settings.apiKeys.maps}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    apiKeys: { ...s.apiKeys, maps: v },
                  }))
                }
              />
              <Field
                label="Analytics"
                value={settings.apiKeys.analytics}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    apiKeys: { ...s.apiKeys, analytics: v },
                  }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-base">Couleurs marque</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {(["primary", "accent", "background"] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="h-10 w-14 p-1"
                      value={settings.colors[key]}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          colors: { ...s.colors, [key]: e.target.value },
                        }))
                      }
                    />
                    <Input
                      value={settings.colors[key]}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          colors: { ...s.colors, [key]: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3">
        <Button variant="accent" onClick={save} disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
