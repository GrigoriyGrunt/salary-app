export type PositionId =
  | "base-picker"
  | "tobacco-picker"
  | "storekeeper"
  | "stacker";

export function getPositionId(position: string): PositionId | null {
  switch (position) {
    case "Комплектовщик основы":
      return "base-picker";

    case "Комплектовщик табака":
      return "tobacco-picker";

    case "Кладовщик":
      return "storekeeper";

    case "Штабелер (водитель погрузчика)":
      return "stacker";

    default:
      return null;
  }
}