import styles from "./WeekDay.module.css";
import Image from "next/image";

type WeekDayProps = {
  day: string;
  date: number;
  month: string;
  active?: boolean;

  shift?: "day" | "night" | "off" | "vacation";

  workType?:
  | "main"
  | "overtime"
  | "extra"
  | "vacation"
  | "do"
  | "absence"
  | "sick"
  | "off"
  | null;

  status?:
    | "none"
    | "vacation"
    | "sick"
    | "absence"
    | "dayOff";
      isWorked?: boolean;
};

export default function WeekDay({
  date,
  shift,
  workType,
  status,
  isWorked,
}: WeekDayProps) {
  const getLabel = () => {
    if (status === "dayOff") return "ДО";
    if (status === "vacation") return "ОТП";
    if (status === "sick") return "БЛ";
    if (status === "absence") return "ПРГ";

    if (shift === "off") return "—";

if (workType === "main") return "ОСН";
if (workType === "extra") return "ДОП";
if (workType === "overtime") return "ОТР";

    return "—";
  };

  return (
    <div
      className={`${styles.card} ${
  isWorked
    ? styles.worked
    : shift === "day"
    ? styles.day
    : shift === "night"
    ? styles.night
    : ""
}`}
    >
      <div className={styles.date}>{date}</div>

      <span className={styles.month}>
        {getLabel()}
      </span>

      <div className={styles.shift}>
        {shift === "day" && (
          <Image
            src={
  isWorked
    ? "/images/icons/grayday.png"
    : "/images/icons/day.png"
}
            alt="Дневная смена"
            width={18}
            height={18}
          />
        )}

        {shift === "night" && (
          <Image
            src={
  isWorked
    ? "/images/icons/graynight.png"
    : "/images/icons/night.png"
}
            alt="Ночная смена"
            width={18}
            height={18}
          />
        )}
      </div>
    </div>
  );
}