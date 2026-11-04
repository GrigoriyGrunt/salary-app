
export type WarehouseId = "rc-khabarovsk" | "rc-kstovo";

export type RateTier = {
  minAverage: number;
  rate: number;
};

export type WarehouseConfig = {
  id: WarehouseId;
  name: string;
  aliases: string[];

  tariffs: {
    monthlySalary: {
  default: number;
  storekeeper: number;
};

experienceBonus: {
  firstYear: number;
  additionalYear: number;
};

    boxes: RateTier[];
    blocks: RateTier[];
    pallets: RateTier[];

    storekeeper: {
      boxRate: number;
      palletRate: number;
      loaderMonthlyBase: number;
      returnBaseHourRate: number;
    };

    nonProfileHourRate: number;
    nightSurchargeRate: number;
    extraShiftMultiplier: number;

    bonuses: {
      discipline: number;
      noErrors: number;
      stackerNoErrors: number;
      absenceDeduction: number;
      errorDeduction: {
        default: number;
        stacker: number;
        storekeeper: number;
      };
    };

    mentor: {
      zeroAverage: {
        boxes: number;
        rate: number;
      };
      tiers: Array<{
        minAverage: number;
        boxes: number;
        rate: number;
      }>;
    };
  };
};

const commonTariffs: WarehouseConfig["tariffs"] = {
  monthlySalary: {
    default: 23750,
    storekeeper: 27000,
  },
experienceBonus: {
  firstYear: 2000,
  additionalYear: 1000,
},
  boxes: [
    { minAverage: 0, rate: 2.7 },
    { minAverage: 1200, rate: 3.6 },
    { minAverage: 1800, rate: 4 },
  ],

  blocks: [
    { minAverage: 0, rate: 0.6 },
    { minAverage: 2200, rate: 0.7 },
    { minAverage: 3200, rate: 0.8 },
    { minAverage: 4000, rate: 1 },
  ],

  pallets: [
    { minAverage: 0, rate: 12 },
    { minAverage: 250, rate: 14 },
    { minAverage: 300, rate: 17 },
  ],

  storekeeper: {
    boxRate: 3,
    palletRate: 15,
    loaderMonthlyBase: 58000,
    returnBaseHourRate: 227,
  },

  nonProfileHourRate: 136,
  nightSurchargeRate: 0.2,
  extraShiftMultiplier: 2,

  bonuses: {
    discipline: 2000,
    noErrors: 5000,
    stackerNoErrors: 2000,
    absenceDeduction: 3000,
    errorDeduction: {
      default: 600,
      stacker: 500,
      storekeeper: 1500,
    },
  },

  mentor: {
    zeroAverage: {
      boxes: 1200,
      rate: 3.6,
    },
    tiers: [
      { minAverage: 0, boxes: 1000, rate: 2.7 },
      { minAverage: 1200, boxes: 1200, rate: 3.6 },
      { minAverage: 1800, boxes: 1800, rate: 4 },
    ],
  },
};

export const warehouseConfigs: Record<
  WarehouseId,
  WarehouseConfig
> = {
  "rc-khabarovsk": {
    id: "rc-khabarovsk",
    name: "РЦ Хабаровск",
    aliases: ["РЦ Хабаровск"],
    tariffs: commonTariffs,
  },

  "rc-kstovo": {
    id: "rc-kstovo",
    name: "РЦ Кстово",
    aliases: ["РЦ Кстово"],
    tariffs: {
      ...commonTariffs,
      boxes: commonTariffs.boxes.map((tier) => ({
        ...tier,
      })),
      blocks: commonTariffs.blocks.map((tier) => ({
        ...tier,
      })),
      pallets: commonTariffs.pallets.map((tier) => ({
        ...tier,
      })),
    },
  },
};

export function getWarehouseConfig(
  warehouse: string | null | undefined
): WarehouseConfig | null {
  const value = warehouse?.trim();

  if (!value) {
    return warehouseConfigs["rc-khabarovsk"];
  }

  return (
    Object.values(warehouseConfigs).find(
      (config) =>
        config.id === value ||
        config.name === value ||
        config.aliases.includes(value)
    ) ?? null
  );
}
