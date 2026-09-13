import { getSettings, updateSettings } from "@/lib/store";

export async function GET() {
  return Response.json({ settings: getSettings() });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const update = {
    ...(body.maximumDiscount !== undefined && { maximumDiscount: Math.min(90, Math.max(0, Number(body.maximumDiscount))) }),
    ...(body.updateIntervalSeconds !== undefined && { updateIntervalSeconds: Math.min(300, Math.max(3, Number(body.updateIntervalSeconds))) }),
    ...(body.demandLevel && { demandLevel: body.demandLevel }),
    ...(body.footTraffic && { footTraffic: body.footTraffic }),
    ...(body.weatherRisk !== undefined && { weatherRisk: Boolean(body.weatherRisk) }),
  };
  return Response.json({ settings: updateSettings(update) });
}
