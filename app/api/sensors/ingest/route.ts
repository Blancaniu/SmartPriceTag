import { attachReading } from "@/lib/store";
import type { SensorReading } from "@/types";

export async function POST(request: Request) {
  const requiredKey = process.env.SENSOR_DEVICE_KEY;
  if (requiredKey && request.headers.get("x-device-key") !== requiredKey) {
    return Response.json({ error: "Invalid device key." }, { status: 401 });
  }
  const body = await request.json();
  if (!body.deviceId || !Number.isFinite(Number(body.temperatureC)) || !Number.isFinite(Number(body.humidityPercent))) {
    return Response.json({ error: "deviceId, temperatureC and humidityPercent are required." }, { status: 400 });
  }
  const reading: SensorReading = {
    deviceId: String(body.deviceId),
    temperatureC: Number(body.temperatureC),
    humidityPercent: Number(body.humidityPercent),
    ...(body.gasPpm !== undefined && { gasPpm: Number(body.gasPpm) }),
    ...(body.visualFreshness !== undefined && { visualFreshness: Number(body.visualFreshness) }),
    recordedAt: new Date().toISOString(),
  };
  const product = attachReading(reading);
  if (!product) return Response.json({ error: "No product uses this sensor device ID." }, { status: 404 });
  return Response.json({ ok: true, product });
}
