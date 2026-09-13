export async function GET() {
  return Response.json({ ok: true, service: "F-freshie", time: new Date().toISOString() });
}
