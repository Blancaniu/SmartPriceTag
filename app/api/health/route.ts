export async function GET() {
  return Response.json({ ok: true, service: "SmartPriceTag", time: new Date().toISOString() });
}
