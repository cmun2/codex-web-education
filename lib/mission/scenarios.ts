import type { MissionScenarioId } from "@/lib/domain/mission";
import type { CoachMissionId } from "@/lib/domain/providers";
import type { DialogPresetId } from "@/lib/mission/code-lab";

export type MissionScenario = {
  id: MissionScenarioId;
  number: 1 | 2;
  initialPresetId: DialogPresetId;
  sourceFunctionName: "DeleteAddressDialog" | "CheckoutDeliverySheet";
  coachMissionId: CoachMissionId;
  storageMissionId: "keyboard-trap-v1" | "flex-tangle-v1";
  bossAliveSrc: string;
  bossDefeatedSrc: string;
};

export const missionScenarios: readonly MissionScenario[] = [
  {
    id: "delete-dialog",
    number: 1,
    initialPresetId: "everything-missing",
    sourceFunctionName: "DeleteAddressDialog",
    coachMissionId: "keyboard-trap",
    storageMissionId: "keyboard-trap-v1",
    bossAliveSrc: "/bosses/keyboard-trap-alive.png",
    bossDefeatedSrc: "/bosses/keyboard-trap-defeated.png",
  },
  {
    id: "checkout-sheet",
    number: 2,
    initialPresetId: "layout-collapse",
    sourceFunctionName: "CheckoutDeliverySheet",
    coachMissionId: "flex-tangle",
    storageMissionId: "flex-tangle-v1",
    bossAliveSrc: "/bosses/flex-tangle-alive.png",
    bossDefeatedSrc: "/bosses/flex-tangle-defeated.png",
  },
] as const;

export const missionScenario = (id: MissionScenarioId): MissionScenario =>
  missionScenarios.find((scenario) => scenario.id === id) ?? missionScenarios[0];
