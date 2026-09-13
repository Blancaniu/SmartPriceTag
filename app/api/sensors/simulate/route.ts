import { attachReading } from "@/lib/store";

export async function POST(request: Request) {
  const { deviceId, storageType = "chilled" } = await request.json();
  const baseline = storageType === "frozen" ? -18 : storageType === "chilled" ? 4 : 22;
  const product = attachReading({
    deviceId,
    temperatureC: Number((baseline + (Math.random() * 6 - 1)).toFixed(1)),
    humidityPercent: Math.round(45 + Math.random() * 35),
    gasPpm: Math.round(180 + Math.random() * 380),
    visualFreshness: Math.round(58 + Math.random() * 40),
    recordedAt: new Date().toISOString(),
  });
  if (!product) return Response.json({ error: "Unknown device ID." }, { status: 404 });
  return Response.json({ product });
}
