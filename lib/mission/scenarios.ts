import {
  flexTangleObjectives,
  keyboardTrapObjectives,
  motionPhantomObjectives,
  stateDoppelgangerObjectives,
  streamGremlinObjectives,
  type MissionObjective,
  type MissionScenarioId,
} from "@/lib/domain/mission";
import type { CoachMissionId } from "@/lib/domain/providers";
import type { DialogPresetId, RepairTabId } from "@/lib/mission/code-lab";

export type MissionScenario = {
  id: MissionScenarioId;
  number: 1 | 2 | 3 | 4 | 5;
  initialPresetId: DialogPresetId;
  presetIds: readonly DialogPresetId[];
  repairTabs: readonly RepairTabId[];
  sourceFunctionName: string;
  coachMissionId: CoachMissionId;
  storageMissionId: string;
  objectives: readonly MissionObjective[];
  bossAliveSrc: string;
  bossDefeatedSrc: string;
};

export const missionScenarios: readonly MissionScenario[] = [
  { id: "delete-dialog", number: 1, initialPresetId: "everything-missing", presetIds: ["everything-missing", "unnamed-modal", "keyboard-trap"], repairTabs: ["accessibility"], sourceFunctionName: "DeleteAddressDialog", coachMissionId: "keyboard-trap", storageMissionId: "keyboard-trap-v2", objectives: keyboardTrapObjectives, bossAliveSrc: "/bosses/keyboard-trap-alive.png", bossDefeatedSrc: "/bosses/keyboard-trap-defeated.png" },
  { id: "checkout-sheet", number: 2, initialPresetId: "layout-collapse", presetIds: ["layout-collapse", "vertical-actions", "misaligned-actions", "cramped-actions"], repairTabs: ["css"], sourceFunctionName: "CheckoutDeliverySheet", coachMissionId: "flex-tangle", storageMissionId: "flex-tangle-v2", objectives: flexTangleObjectives, bossAliveSrc: "/bosses/flex-tangle-alive.png", bossDefeatedSrc: "/bosses/flex-tangle-defeated.png" },
  { id: "motion-card", number: 3, initialPresetId: "motion-marathon", presetIds: ["motion-marathon", "motion-no-fallback"], repairTabs: ["motion"], sourceFunctionName: "CelebrationCard", coachMissionId: "motion-phantom", storageMissionId: "motion-phantom-v1", objectives: motionPhantomObjectives, bossAliveSrc: "/bosses/motion-phantom-alive.png", bossDefeatedSrc: "/bosses/motion-phantom-defeated.png" },
  { id: "ai-stream", number: 4, initialPresetId: "stream-buffered", presetIds: ["stream-buffered", "stream-reconnect-loop"], repairTabs: ["stream"], sourceFunctionName: "AiReplyStream", coachMissionId: "stream-gremlin", storageMissionId: "stream-gremlin-v1", objectives: streamGremlinObjectives, bossAliveSrc: "/bosses/stream-gremlin-alive.png", bossDefeatedSrc: "/bosses/stream-gremlin-defeated.png" },
  { id: "state-counter", number: 5, initialPresetId: "state-mutation", presetIds: ["state-mutation", "state-stale-reset"], repairTabs: ["state"], sourceFunctionName: "CartQuantityState", coachMissionId: "state-doppelganger", storageMissionId: "state-doppelganger-v1", objectives: stateDoppelgangerObjectives, bossAliveSrc: "/bosses/state-doppelganger-alive.png", bossDefeatedSrc: "/bosses/state-doppelganger-defeated.png" },
] as const;

export const missionScenario = (id: MissionScenarioId): MissionScenario =>
  missionScenarios.find((scenario) => scenario.id === id) ?? missionScenarios[0];
