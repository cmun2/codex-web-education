import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisualCoach } from "@/components/visual-coach";
import {
  coachMissionId,
  DeterministicCoachProvider,
  maxCoachImageBytes,
  type CoachInput,
  validateCoachInput,
  validateCoachStructuredOutput,
} from "@/lib/domain/providers";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { brokenDialogCode } from "@/lib/mission/code-lab";
import { LocalVisionCoachProvider } from "@/lib/server/local-vision-coach";

const validInput = (attemptNumber = 1): CoachInput => ({
  missionId: coachMissionId,
  failedObjectiveIds: ["identity", "focus", "keyboard", "layout"],
  codeState: { ...brokenDialogCode },
  snapshot: {
    contract: "fixture-region-v1",
    regionTestId: "mission-fixture",
    dimensions: { width: 480, height: 440 },
    imageDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E",
  },
  attemptNumber,
  locale: "en",
});

const structuredOutput = {
  observation: "The dialog is visible.",
  hint: "Inspect its identity first.",
  whyItMatters: "Users need context.",
  inspectNext: "Inspect the role.",
  bossTaunt: "I found the missing contract!",
};

const ollamaResponse = (content: unknown): Response => new Response(JSON.stringify({
  message: { content: JSON.stringify(content) },
}), { status: 200, headers: { "content-type": "application/json" } });

describe("coach input boundary", () => {
  it("accepts only sanitized mission context and rejects prompt, command, path, repository, source, and credential fields", () => {
    expect(validateCoachInput(validInput()).ok).toBe(true);
    const forbiddenFields = ["prompt", "shellCommand", "filePath", "repository", "source", "credentials"];
    for (const field of forbiddenFields) {
      expect(validateCoachInput({ ...validInput(), [field]: "DO_NOT_EXPOSE" })).toEqual({
        ok: false,
        error: "UNSUPPORTED_FIELD",
      });
    }
  });

  it("rejects invalid image formats", () => {
    expect(validateCoachInput({
      ...validInput(),
      snapshot: { ...validInput().snapshot, imageDataUrl: "data:text/html;base64,PHNjcmlwdD4=" },
    })).toEqual({ ok: false, error: "INVALID_IMAGE" });
    expect(validateCoachInput({
      ...validInput(),
      snapshot: {
        ...validInput().snapshot,
        imageDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E%3C%2Fsvg%3E",
      },
    })).toEqual({ ok: false, error: "INVALID_IMAGE" });
  });

  it("rejects an oversized selected snapshot", () => {
    const encodedLength = Math.ceil((maxCoachImageBytes + 1) / 3) * 4;
    expect(validateCoachInput({
      ...validInput(),
      snapshot: { ...validInput().snapshot, imageDataUrl: `data:image/png;base64,${"A".repeat(encodedLength)}` },
    })).toEqual({ ok: false, error: "IMAGE_TOO_LARGE" });
  });

  it("validates the exact structured output schema", () => {
    expect(validateCoachStructuredOutput(structuredOutput)).toEqual({ ok: true, value: structuredOutput });
    expect(validateCoachStructuredOutput({ ...structuredOutput, arbitraryHtml: "<b>unsafe</b>" })).toEqual({ ok: false });
    expect(validateCoachStructuredOutput({ ...structuredOutput, hint: "" })).toEqual({ ok: false });
  });
});

describe("coach providers", () => {
  it("labels deterministic responses and advances one hint level per verified attempt", async () => {
    const provider = new DeterministicCoachProvider();
    await expect(provider.coach(validInput(1))).resolves.toMatchObject({ provider: "demo", hintLevel: 1, usedFallback: false });
    await expect(provider.coach(validInput(2))).resolves.toMatchObject({ provider: "demo", hintLevel: 2, usedFallback: false });
    await expect(provider.coach(validInput(9))).resolves.toMatchObject({ provider: "demo", hintLevel: 3, usedFallback: false });
  });

  it("labels validated Ollama responses as Local Vision Coach without exposing model configuration", async () => {
    let requestBody = "";
    const fetcher = async (_url: string, init: RequestInit): Promise<Response> => {
      requestBody = typeof init.body === "string" ? init.body : "";
      return ollamaResponse(structuredOutput);
    };
    const provider = new LocalVisionCoachProvider({
      baseUrl: "http://127.0.0.1:11434",
      model: "private-local-model-name",
      fetcher,
    });
    await expect(provider.coach(validInput())).resolves.toMatchObject({ provider: "local-vision", usedFallback: false });
    expect(requestBody).toContain("private-local-model-name");
    expect(JSON.stringify(await provider.coach(validInput()))).not.toContain("private-local-model-name");
  });

  it("falls back deterministically when Ollama is unavailable", async () => {
    const fetcher = async (): Promise<Response> => new Response("unavailable", { status: 503 });
    const provider = new LocalVisionCoachProvider({ model: "local-model", fetcher });
    await expect(provider.coach(validInput())).resolves.toMatchObject({ provider: "demo", usedFallback: true });
  });

  it("falls back on timeout", async () => {
    const fetcher = async (_url: string, init: RequestInit): Promise<Response> =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
      });
    const provider = new LocalVisionCoachProvider({ model: "local-model", fetcher, timeoutMs: 5 });
    await expect(provider.coach(validInput())).resolves.toMatchObject({ provider: "demo", usedFallback: true });
  });

  it("falls back when the local response violates the schema", async () => {
    const fetcher = async (): Promise<Response> => ollamaResponse({ ...structuredOutput, hint: 42 });
    const provider = new LocalVisionCoachProvider({ model: "local-model", fetcher });
    await expect(provider.coach(validInput())).resolves.toMatchObject({ provider: "demo", usedFallback: true });
  });
});

describe("safe coach rendering", () => {
  it("renders coach fields as text rather than raw HTML", () => {
    const malicious = "<img src=x onerror=globalThis.compromised=true><script>globalThis.compromised=true</script>";
    const rendered = render(
      <VisualCoach
        copy={dictionaries.en.coach}
        insight={{
          observation: malicious,
          hint: malicious,
          whyItMatters: malicious,
          inspectNext: malicious,
          bossTaunt: malicious,
          provider: "demo",
          usedFallback: false,
          hintLevel: 1,
        }}
        loading={false}
        error={false}
        canAsk
        hintAlreadyRevealed
        onAsk={() => undefined}
        onReturnToCodeLab={() => undefined}
      />,
    );
    expect(rendered.container.querySelector("script")).toBeNull();
    expect(rendered.container.querySelector("img")).toBeNull();
    expect(rendered.container.textContent).toContain(malicious);
    expect(Reflect.get(globalThis, "compromised")).toBeUndefined();
  });

  it("uses the explicit Local Vision Coach label for a validated local response", () => {
    const rendered = render(
      <VisualCoach
        copy={dictionaries.en.coach}
        insight={{ ...structuredOutput, provider: "local-vision", usedFallback: false, hintLevel: 2 }}
        loading={false}
        error={false}
        canAsk
        hintAlreadyRevealed
        onAsk={() => undefined}
        onReturnToCodeLab={() => undefined}
      />,
    );
    expect(rendered.container.textContent).toContain("Local Vision Coach");
    expect(rendered.container.textContent).toContain("Progressive hint 2 of 3");
  });

  it("labels deterministic fallback when the local provider is unavailable", () => {
    const rendered = render(
      <VisualCoach
        copy={dictionaries.en.coach}
        insight={{ ...structuredOutput, provider: "demo", usedFallback: true, hintLevel: 1 }}
        loading={false}
        error={false}
        canAsk
        hintAlreadyRevealed
        onAsk={() => undefined}
        onReturnToCodeLab={() => undefined}
      />,
    );
    expect(rendered.container.textContent).toContain("Demo Coach");
    expect(rendered.container.textContent).toContain("Local Vision Coach was unavailable");
  });
});
