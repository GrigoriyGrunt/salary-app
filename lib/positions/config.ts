import type { PositionId } from "./index";

export type PositionConfig = {
  id: PositionId;
  name: string;
  productionUnit: "boxes" | "blocks";
};

export const positionConfigs: Record<PositionId, PositionConfig> = {
  "base-picker": {
    id: "base-picker",
    name: "Комплектовщик основы",
    productionUnit: "boxes",
  },

  "tobacco-picker": {
    id: "tobacco-picker",
    name: "Комплектовщик табака",
    productionUnit: "blocks",
  },

  storekeeper: {
    id: "storekeeper",
    name: "Кладовщик",
    productionUnit: "boxes",
  },

  stacker: {
    id: "stacker",
    name: "Штабелер (водитель погрузчика)",
    productionUnit: "boxes",
  },
};