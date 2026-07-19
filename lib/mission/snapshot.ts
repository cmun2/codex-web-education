import type { DialogCodeState, ObjectiveResult, SnapshotEvidence } from "@/lib/domain/mission";

export type SnapshotCaptureInput = {
  root: HTMLElement;
  attemptNumber: number;
  locale: "ko" | "en";
  codeState: DialogCodeState;
  objectiveResults: ObjectiveResult[];
  now?: () => Date;
};

const removeUnsafeContent = (wrapper: HTMLElement): void => {
  for (const blocked of Array.from(wrapper.querySelectorAll("script, iframe, object, embed"))) blocked.remove();
  for (const element of Array.from(wrapper.querySelectorAll("*"))) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.toLowerCase().startsWith("on")) element.removeAttribute(attribute.name);
      if (attribute.name === "src" || attribute.name === "srcset") element.removeAttribute(attribute.name);
    }
  }
};

export function captureSnapshotEvidence(input: SnapshotCaptureInput): SnapshotEvidence {
  const fixture = input.root.querySelector<HTMLElement>("[data-testid='mission-fixture']");
  if (!fixture) throw new Error("Fixture region is unavailable for snapshot capture.");

  const bounds = fixture.getBoundingClientRect();
  const width = Math.max(320, Math.round(bounds.width || fixture.clientWidth || 480));
  const height = Math.max(240, Math.round(bounds.height || fixture.clientHeight || 440));
  const wrapper = fixture.ownerDocument.createElement("div");
  wrapper.append(fixture.cloneNode(true));
  removeUnsafeContent(wrapper);

  const serializedFixture = new XMLSerializer().serializeToString(wrapper.firstElementChild ?? wrapper);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="box-sizing:border-box;width:100%;height:100%;overflow:hidden;background:#141a31;color:#f4f6ff;padding:16px;font-family:Arial,sans-serif">${serializedFixture}</div></foreignObject></svg>`;

  return {
    contract: "fixture-region-v1",
    attemptNumber: input.attemptNumber,
    locale: input.locale,
    capturedAt: (input.now ?? (() => new Date()))().toISOString(),
    regionTestId: "mission-fixture",
    dimensions: { width, height },
    codeState: { ...input.codeState },
    objectiveResults: input.objectiveResults.map((result) => ({
      ...result,
      checks: [...result.checks],
      failureCodes: [...result.failureCodes],
    })),
    imageDataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  };
}
