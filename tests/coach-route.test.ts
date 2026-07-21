import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/coach/route";
import { coachMissionId, maxCoachRequestBytes } from "@/lib/domain/providers";
import { brokenDialogCode } from "@/lib/mission/code-lab";

const requestBody = {
  missionId: coachMissionId,
  failedObjectiveIds: ["identity"],
  codeState: brokenDialogCode,
  snapshot: {
    contract: "fixture-region-v1",
    regionTestId: "mission-fixture",
    dimensions: { width: 480, height: 440 },
    imageDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E",
  },
  attemptNumber: 1,
  locale: "en",
};

describe("coach API boundary", () => {
  it("serves the deterministic provider by default", async () => {
    const response = await POST(new Request("http://localhost/api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
    }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ provider: "demo", usedFallback: false, hintLevel: 1 });
  });

  it("rejects request bodies declared above the limit before parsing", async () => {
    const response = await POST(new Request("http://localhost/api/coach", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(maxCoachRequestBytes + 1),
      },
      body: "{}",
    }));
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "REQUEST_TOO_LARGE" });
  });

  it("returns a generic validation error without reflecting unsafe input", async () => {
    const response = await POST(new Request("http://localhost/api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...requestBody, credentials: "SUPER_SECRET_VALUE" }),
    }));
    expect(response.status).toBe(400);
    const body = JSON.stringify(await response.json());
    expect(body).toBe('{"error":"UNSUPPORTED_FIELD"}');
    expect(body).not.toContain("SUPER_SECRET_VALUE");
  });
});
