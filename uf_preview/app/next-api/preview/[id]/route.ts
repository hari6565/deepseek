// In-memory hand-off point for a locally-generated preview: the
// deepseek-harness uf_preview plugin POSTs generated code here after calling
// tgw-codeGeneration, and app/UF/page.tsx polls GET to pick it up. Single
// dev-server process only -- not durable, not for multi-instance deployment.
import { NextRequest, NextResponse } from 'next/server'

let latestCode: any = {}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }:any = await params;

  if( id )
  return NextResponse.json({
    code: latestCode[id],
  });
}
export async function POST(req: NextRequest) {
  const body: unknown = await req.json().catch(() => null)
  const {code ,uuid}:any= body
  if (typeof code !== 'string' || code.length === 0) {
    return NextResponse.json({ error: 'body.code must be a non-empty string' }, { status: 400 })
  }
  latestCode={...latestCode,[uuid]:code}
  return NextResponse.json({ ok: true })
}