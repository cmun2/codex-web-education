import { NextResponse } from "next/server";
import {
  DeterministicCoachProvider,
  maxCoachRequestBytes,
  validateCoachInput,
} from "@/lib/domain/providers";
import { LocalVisionCoachProvider } from "@/lib/server/local-vision-coach";

export const runtime = "nodejs";

const readLimitedBody = async (request: Request): Promise<{ ok: true; text: string } | { ok: false }> => {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const parsed = Number(declaredLength);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > maxCoachRequestBytes) return { ok: false };
  }
  if (!request.body) return { ok: false };
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    received += chunk.value.byteLength;
    if (received > maxCoachRequestBytes) {
      await reader.cancel();
      return { ok: false };
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return { ok: true, text: text + decoder.decode() };
};

export async function POST(request: Request): Promise<NextResponse> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return NextResponse.json({ error: "UNSUPPORTED_MEDIA_TYPE" }, { status: 415 });
  }
  const body = await readLimitedBody(request);
  if (!body.ok) return NextResponse.json({ error: "REQUEST_TOO_LARGE" }, { status: 413 });

  let parsed: unknown;
  try {
    parsed = JSON.parse(body.text);
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const validated = validateCoachInput(parsed);
  if (!validated.ok) {
    const status = validated.error === "IMAGE_TOO_LARGE" ? 413 : 400;
    return NextResponse.json({ error: validated.error }, { status });
  }

  const provider = process.env.AI_COACH_PROVIDER === "ollama"
    ? new LocalVisionCoachProvider({
        baseUrl: process.env.OLLAMA_BASE_URL,
        model: process.env.OLLAMA_VISION_MODEL,
      })
    : new DeterministicCoachProvider();
  const insight = await provider.coach(validated.value);
  return NextResponse.json(insight, {
    headers: { "cache-control": "no-store" },
  });
}
