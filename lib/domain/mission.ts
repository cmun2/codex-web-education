export type ObjectiveStatus = "pending" | "passed" | "failed";

export type MissionObjective = {
  id: "identity" | "focus" | "keyboard";
  title: string;
  damage: number;
};

export type ObjectiveResult = {
  objectiveId: MissionObjective["id"];
  status: ObjectiveStatus;
  checks: string[];
  failureCodes: string[];
};

export const keyboardTrapObjectives: MissionObjective[] = [
  { id: "identity", title: "Dialog identity", damage: 30 },
  { id: "focus", title: "Focus containment", damage: 35 },
  { id: "keyboard", title: "Keyboard & actions", damage: 35 },
];

export const bossHealth = (results: ObjectiveResult[]) =>
  Math.max(0, 100 - results.filter((result) => result.status === "passed").reduce((sum, result) => sum + (keyboardTrapObjectives.find((objective) => objective.id === result.objectiveId)?.damage ?? 0), 0));

export const missionComplete = (results: ObjectiveResult[]) =>
  keyboardTrapObjectives.every((objective) => results.some((result) => result.objectiveId === objective.id && result.status === "passed"));
