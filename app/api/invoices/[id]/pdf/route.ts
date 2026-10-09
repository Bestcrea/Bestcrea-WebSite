import { NextRequest } from "next/server";
import { GET as documentPdf } from "@/app/api/documents/[type]/[id]/pdf/route";

export const runtime = "nodejs";

/** Legacy path kept for existing links; delegates to the unified document PDF route. */
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return documentPdf(request, { params: Promise.resolve({ type: "invoice", id: params.id }) });
}
