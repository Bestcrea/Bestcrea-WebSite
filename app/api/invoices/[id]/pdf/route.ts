import { NextRequest } from "next/server";
import { GET as documentPdf } from "@/app/api/documents/[type]/[id]/pdf/route";

export const runtime = "nodejs";

/** Legacy path kept for existing links; delegates to the unified document PDF route. */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return documentPdf(request, { params: { type: "invoice", id: params.id } });
}
