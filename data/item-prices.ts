export type StoreItemKey = "helmet" | "gloves" | "dagger" | "boots" | "sword" | "plate" | "shield";

export type ItemPriceConfig = {
  itemKey: StoreItemKey;
  imageSrc: string;
  price: number;
};

// Keep this array in purchase order.
// `plate` currently uses /hand-shield.png as the available placeholder asset.
export const ORDERED_STORE_ITEMS: ItemPriceConfig[] = [
  { itemKey: "helmet", imageSrc: "/helmet.png", price: 100 },
  { itemKey: "gloves", imageSrc: "/gloves.png", price: 200 },
  { itemKey: "dagger", imageSrc: "/dagger.png", price: 300 },
  { itemKey: "boots", imageSrc: "/boots.png", price: 400 },
  { itemKey: "plate", imageSrc: "/plate.png", price: 500 },
  { itemKey: "sword", imageSrc: "/sword.png", price: 600 },
  { itemKey: "shield", imageSrc: "/shield-store.png", price: 700 },
];
