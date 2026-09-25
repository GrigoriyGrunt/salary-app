import DatePicker from "@/components/DatePicker/DatePicker";

type Props = {
  isDayNight: boolean;
  isWatch1515: boolean;

  firstDate?: Date;
  secondDate?: Date;

  onFirstDateChange: (date: Date) => void;
  onSecondDateChange: (date: Date) => void;

  firstShift: "day" | "night" | null;
  secondShift: "day" | "night" | null;

  onFirstShiftChange: (
    shift: "day" | "night"
  ) => void;

  onSecondShiftChange: (
    shift: "day" | "night"
  ) => void;

  styles: Record<string, string>;
minDate?: Date;
hasDatesError?: boolean;
showScheduleChangeHint?: boolean;
};

export default function NextShiftSelector({
  isDayNight,
  isWatch1515,

  firstDate,
  secondDate,

  onFirstDateChange,
  onSecondDateChange,

  firstShift,
  secondShift,

  onFirstShiftChange,
  onSecondShiftChange,

  styles,
minDate,
hasDatesError,
showScheduleChangeHint,
}: Props) {
  return (
  <>
    {showScheduleChangeHint && !isWatch1515 && (
  <div
    style={{
      padding: "12px 14px",
      borderRadius: "12px",
      background: "#f5f5f5",
      fontSize: "14px",
      lineHeight: "1.4",
    }}
  >
    Укажите две ближайшие основные смены нового графика,
    начиная с даты изменения.
  </div>
)}
  <div className={styles.card}>
    <DatePicker
      label={
        isWatch1515
          ? "Начало текущей вахты"
          : "Первая ближайшая смена"
      }
      value={firstDate}
      onChange={onFirstDateChange}
      mode="nextShift"
      minDate={minDate}
    />

    {isDayNight && (
      <div className={styles.buttons}>
        <button
          type="button"
          className={`${styles.shiftButton} ${
            firstShift === "day"
              ? styles.active
              : ""
          }`}
          onClick={() =>
            onFirstShiftChange("day")
          }
        >
          День
        </button>

        <button
          type="button"
          className={`${styles.shiftButton} ${
            firstShift === "night"
              ? styles.active
              : ""
          }`}
          onClick={() =>
            onFirstShiftChange("night")
          }
        >
          Ночь
        </button>
      </div>
    )}
  </div>

  <div className={styles.card}>
    <DatePicker
      label={
        isWatch1515
          ? "Конец текущей вахты"
          : "Вторая ближайшая смена"
      }
      value={secondDate}
      onChange={onSecondDateChange}
      mode="nextShift"
      minDate={minDate}
    />

    {isDayNight && (
      <div className={styles.buttons}>
        <button
          type="button"
          className={`${styles.shiftButton} ${
            secondShift === "day"
              ? styles.active
              : ""
          }`}
          onClick={() =>
            onSecondShiftChange("day")
          }
        >
          День
        </button>

        <button
          type="button"
          className={`${styles.shiftButton} ${
            secondShift === "night"
              ? styles.active
              : ""
          }`}
          onClick={() =>
            onSecondShiftChange("night")
          }
        >
          Ночь
        </button>
      </div>
    )}
    </div>

  {hasDatesError && !isWatch1515 && (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "12px",
        background: "#fff1f1",
        fontSize: "14px",
        lineHeight: "1.4",
      }}
    >
      Выбранные даты смен не соответствуют циклу
      графика. Укажите две ближайшие основные смены:
      они должны идти подряд или быть разделены
      двумя выходными днями.
    </div>
  )}
</>
  );
}
