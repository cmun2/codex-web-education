export const keyboardTrapMissionId = "keyboard-trap-v1";

export type SoundChoice = "on" | "muted";

export type StoredProgression = {
  completedMissionIds: string[];
  bestAttemptCount: number | null;
  totalXp: number;
  soundChoice: SoundChoice;
};

export type ProgressionRead = {
  value: StoredProgression;
  storageAvailable: boolean;
};

export type MissionCompletion = {
  value: StoredProgression;
  awardedXp: number;
  storageAvailable: boolean;
};

export interface ProgressionStorage {
  read(): ProgressionRead;
  setSoundChoice(choice: SoundChoice): ProgressionRead;
  recordCompletion(missionId: string, attempts: number, verifiedXp: number): MissionCompletion;
}

type StoragePort = Pick<Storage, "getItem" | "setItem">;

const storageKey = "frontend-debugging-arena-progression-v1";

const browserStorage = (): StoragePort | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const defaultProgression = (): StoredProgression => ({
  completedMissionIds: [],
  bestAttemptCount: null,
  totalXp: 0,
  soundChoice: "on",
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseProgression = (raw: string | null): StoredProgression => {
  if (raw === null) return defaultProgression();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return defaultProgression();
    const completedMissionIds = Array.isArray(parsed.completedMissionIds) &&
      parsed.completedMissionIds.every((id) => typeof id === "string")
      ? [...new Set(parsed.completedMissionIds)]
      : [];
    const bestAttemptCount = typeof parsed.bestAttemptCount === "number" &&
      Number.isInteger(parsed.bestAttemptCount) && parsed.bestAttemptCount > 0
      ? parsed.bestAttemptCount
      : null;
    const totalXp = typeof parsed.totalXp === "number" && Number.isInteger(parsed.totalXp) && parsed.totalXp >= 0
      ? parsed.totalXp
      : 0;
    const soundChoice: SoundChoice = parsed.soundChoice === "muted" ? "muted" : "on";
    return { completedMissionIds, bestAttemptCount, totalXp, soundChoice };
  } catch {
    return defaultProgression();
  }
};

export class LocalProgressionStorage implements ProgressionStorage {
  private memory = defaultProgression();

  constructor(private readonly storage: StoragePort | null = browserStorage()) {}

  read(): ProgressionRead {
    if (this.storage === null) return { value: this.memory, storageAvailable: false };
    try {
      this.memory = parseProgression(this.storage.getItem(storageKey));
      return { value: this.memory, storageAvailable: true };
    } catch {
      return { value: this.memory, storageAvailable: false };
    }
  }

  private write(value: StoredProgression): ProgressionRead {
    this.memory = value;
    if (this.storage === null) return { value, storageAvailable: false };
    try {
      this.storage.setItem(storageKey, JSON.stringify(value));
      return { value, storageAvailable: true };
    } catch {
      return { value, storageAvailable: false };
    }
  }

  setSoundChoice(choice: SoundChoice): ProgressionRead {
    const current = this.read();
    return this.write({ ...current.value, soundChoice: choice });
  }

  recordCompletion(missionId: string, attempts: number, verifiedXp: number): MissionCompletion {
    const current = this.read();
    const alreadyCompleted = current.value.completedMissionIds.includes(missionId);
    const awardedXp = alreadyCompleted || !Number.isInteger(verifiedXp) || verifiedXp < 0 ? 0 : verifiedXp;
    const safeAttempts = Number.isInteger(attempts) && attempts > 0 ? attempts : 1;
    const value: StoredProgression = {
      ...current.value,
      completedMissionIds: alreadyCompleted
        ? current.value.completedMissionIds
        : [...current.value.completedMissionIds, missionId],
      bestAttemptCount: current.value.bestAttemptCount === null
        ? safeAttempts
        : Math.min(current.value.bestAttemptCount, safeAttempts),
      totalXp: current.value.totalXp + awardedXp,
    };
    const written = this.write(value);
    return { ...written, awardedXp };
  }
}
