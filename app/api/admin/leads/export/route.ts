import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const header = [
    "id",
    "name",
    "email",
    "phone",
    "company",
    "status",
    "source",
    "locale",
    "message",
    "createdAt",
  ];
  const rows = leads.map((lead) =>
    [
      lead.id,
      lead.name,
      lead.email,
      lead.phone || "",
      lead.company || "",
      lead.status,
      lead.source || "",
      lead.locale,
      (lead.message || "").replace(/\n/g, " "),
      lead.createdAt.toISOString(),
    ]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-export.csv"`,
    },
  });
}
