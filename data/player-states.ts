export type PlayerStateConfig = {
  state: number;
  itemKey: "nothing" | "helmet" | "gloves" | "dagger" | "boots" | "plate" | "sword" | "shield";
  requiredItemSrc: string | null;
  kidImageSrc: string;
};

// Update kidImageSrc per state when you have dedicated PNGs for each look.
export const PLAYER_STATES: PlayerStateConfig[] = [
  { state: 0, itemKey: "nothing", requiredItemSrc: null, kidImageSrc: "/kid/basic-kid-new.png" },
  { state: 1, itemKey: "helmet", requiredItemSrc: "/helmet.png", kidImageSrc: "/kid/kid-helmet.png" },
  { state: 2, itemKey: "gloves", requiredItemSrc: "/gloves.png", kidImageSrc: "/kid/kid-helmet-gloves.png" },
  { state: 3, itemKey: "dagger", requiredItemSrc: "/dagger.png", kidImageSrc: "/kid/kid-helmet-gloves-dagger.png" },
  { state: 4, itemKey: "boots", requiredItemSrc: "/boots.png", kidImageSrc: "/kid/kid-helmet-gloves-dagger-boots.png" },
  { state: 5, itemKey: "plate", requiredItemSrc: "/plate.png", kidImageSrc: "/kid/kid-helmet-gloves-dagger-boots-plate.png" },
  { state: 6, itemKey: "sword", requiredItemSrc: "/sword.png", kidImageSrc: "/kid/kid-helmet-gloves-sword-boots-plate.png" },
  { state: 7, itemKey: "shield", requiredItemSrc: "/shield-store.png", kidImageSrc: "/kid/kid-helmet-gloves-sword-boots-plate-shield.png" },
];

export function getPlayerState(inventoryItems: string[]): PlayerStateConfig {
  let resolved = PLAYER_STATES[0];

  for (const candidate of PLAYER_STATES.slice(1)) {
    if (!candidate.requiredItemSrc) {
      continue;
    }

    if (inventoryItems.includes(candidate.requiredItemSrc)) {
      resolved = candidate;
      continue;
    }

    break;
  }

  return resolved;
}
