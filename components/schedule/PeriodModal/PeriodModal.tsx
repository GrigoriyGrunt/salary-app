import { useState } from "react";
import styles from "./PeriodModal.module.css";

const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  let result = "";

  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) {
      result += ".";
    }

    result += digits[i];
  }

  return result;
};

const parseDate = (value: string) => {
  const [day, month, year] = value.split(".").map(Number);

  return new Date(year, month - 1, day);
};

type PeriodType = "vacation" | "sick";
type VacationType = "annual" | "unpaid";

type PeriodModalProps = {
  title: string;
  open: boolean;
  type: PeriodType | null;
  onClose: () => void;
  onSave: (
    startDate: Date,
    endDate: Date,
    type: PeriodType,
    vacationType?: VacationType
  ) => void;
};

export default function PeriodModal({
  title,
  open,
  type,
  onClose,
  onSave,
}: PeriodModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vacationType, setVacationType] =
    useState<VacationType>("annual");
    const [isVacationTypeOpen, setIsVacationTypeOpen] =
  useState(false);

  if (!open || !type) return null;

  const handleSave = () => {
    if (!startDate || !endDate) return;

    if (
  startDate.length !== 10 ||
  endDate.length !== 10
) {
  return;
}

onSave(
  parseDate(startDate),
  parseDate(endDate),
  type,
  type === "vacation"
    ? vacationType
    : undefined
);

    setStartDate("");
    setEndDate("");
    setVacationType("annual");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>

        {type === "vacation" && (
  <div className={styles.vacationType}>
    <span className={styles.vacationLabel}>
      Вид отпуска
    </span>

    <button
      type="button"
      className={styles.vacationSelect}
      onClick={() =>
        setIsVacationTypeOpen(
          !isVacationTypeOpen
        )
      }
    >
      <span>
        {vacationType === "annual"
          ? "Ежегодный"
          : "За свой счёт"}
      </span>

      <span
        className={`${styles.vacationArrow} ${
          isVacationTypeOpen
            ? styles.vacationArrowOpen
            : ""
        }`}
      >
        ▾
      </span>
    </button>

    {isVacationTypeOpen && (
      <div className={styles.vacationOptions}>
        <button
          type="button"
          className={styles.vacationOption}
          onClick={() => {
            setVacationType("annual");
            setIsVacationTypeOpen(false);
          }}
        >
          Ежегодный
        </button>

        <button
          type="button"
          className={styles.vacationOption}
          onClick={() => {
            setVacationType("unpaid");
            setIsVacationTypeOpen(false);
          }}
        >
          За свой счёт
        </button>
      </div>
    )}
  </div>
)}

        <label>
  С
  <input
    type="text"
    inputMode="numeric"
    placeholder="ДД.ММ.ГГГГ"
    maxLength={10}
    value={startDate}
    onChange={(e) =>
      setStartDate(
        formatDateInput(e.target.value)
      )
    }
  />
</label>

        <label>
  По
  <input
    type="text"
    inputMode="numeric"
    placeholder="ДД.ММ.ГГГГ"
    maxLength={10}
    value={endDate}
    onChange={(e) =>
      setEndDate(
        formatDateInput(e.target.value)
      )
    }
  />
</label>

        <button onClick={handleSave}>
          Сохранить
        </button>

        <button onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  );
}