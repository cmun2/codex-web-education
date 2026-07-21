import { describe, expect, it } from "vitest";
import {
  defaultProgression,
  keyboardTrapMissionId,
  LocalProgressionStorage,
} from "@/lib/progression/storage";

const memoryStorage = (initial: string | null = null) => {
  let value = initial;
  return {
    getItem: (): string | null => value,
    setItem: (key: string, next: string): void => {
      void key;
      value = next;
    },
  };
};

describe("lightweight local progression", () => {
  it("recovers from corrupted data with safe defaults", () => {
    const storage = new LocalProgressionStorage(memoryStorage("{not-json"));
    expect(storage.read()).toEqual({ value: defaultProgression(), storageAvailable: true });
  });

  it("keeps working in memory when storage access is blocked", () => {
    const blocked = {
      getItem: (): string | null => {
        throw new DOMException("blocked", "SecurityError");
      },
      setItem: (): void => {
        throw new DOMException("blocked", "SecurityError");
      },
    };
    const storage = new LocalProgressionStorage(blocked);
    expect(storage.setSoundChoice("muted")).toMatchObject({ storageAvailable: false, value: { soundChoice: "muted" } });
    const completed = storage.recordCompletion(keyboardTrapMissionId, 2, 300);
    expect(completed).toMatchObject({ storageAvailable: false, awardedXp: 300, value: { totalXp: 300, bestAttemptCount: 2, soundChoice: "muted" } });
  });

  it("never awards lifetime XP twice for the same completed mission and keeps the best attempt count", () => {
    const storage = new LocalProgressionStorage(memoryStorage());
    const first = storage.recordCompletion(keyboardTrapMissionId, 4, 300);
    const replay = storage.recordCompletion(keyboardTrapMissionId, 2, 300);
    expect(first.awardedXp).toBe(300);
    expect(replay).toMatchObject({ awardedXp: 0, value: { totalXp: 300, bestAttemptCount: 2 } });
    expect(replay.value.completedMissionIds).toEqual([keyboardTrapMissionId]);
  });
});
