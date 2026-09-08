import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useShiftEditor,
} from "@/components/common/ShiftEditorProvider/ShiftEditorProvider";
import styles from "./ShiftEditorSheet.module.css";
import { useScheduleStore } from "@/store/scheduleStore";

interface ShiftEditorSheetProps {
  isOpen: boolean;
  onClose: () => void;
}
function isTransitionNightShift(
  date: Date | null | undefined,
  shiftTime: string
) {
  if (!date || shiftTime !== "night") {
    return false;
  }

  const nextDay = new Date(date);

  nextDay.setDate(
    date.getDate() + 1
  );

  return (
    nextDay.getMonth() !==
    date.getMonth()
  );
}
export default function ShiftEditorSheet({
  isOpen,
  onClose,
}: ShiftEditorSheetProps) {
    const { selectedDate } = useShiftEditor();
    const updateShift = useScheduleStore(
  (state) => state.updateShift
);
const shifts = useScheduleStore(
  (state) => state.shifts
);
const currentUserId = useScheduleStore(
  (state) => state.currentUserId
);
  const [dayType, setDayType] = useState("");
const [shiftTime, setShiftTime] = useState("");
const [workZone, setWorkZone] = useState<
  "" | "none" | "base" | "base_tobacco" | "tobacco" | "warehouse"
>("");
const [isWorkZoneOpen, setIsWorkZoneOpen] = useState(false);
const [isDayTypeOpen, setIsDayTypeOpen] = useState(false);
const [isMentor, setIsMentor] = useState(false);

const [salaryHours, setSalaryHours] = useState("");
const [baseHours, setBaseHours] = useState("");
const [boxes, setBoxes] = useState("");
const [tobaccoHours, setTobaccoHours] = useState("");
const [blocks, setBlocks] = useState("");
const [nonProfileHours, setNonProfileHours] = useState("");
const isTransitionShift =
  ["main", "overtime", "extra"].includes(dayType) &&
  workZone !== "" &&
  workZone !== "none" &&
  isTransitionNightShift(
    selectedDate,
    shiftTime
  );
  const firstTransitionDate =
  selectedDate
    ? new Date(selectedDate)
    : null;

const secondTransitionDate =
  selectedDate
    ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() + 1
      )
    : null;
  const transitionSalaryHours =
  Number(salaryHours) || 0;

const firstMonthSalaryHours =
  Math.min(
    transitionSalaryHours,
    4
  );

const secondMonthSalaryHours =
  Math.max(
    transitionSalaryHours - 4,
    0
  );
  const [transitionMode, setTransitionMode] =
  useState<"manual" | "auto" | null>(null);

const [firstBaseHours, setFirstBaseHours] =
  useState("");

const [secondBaseHours, setSecondBaseHours] =
  useState("");

const [firstTobaccoHours, setFirstTobaccoHours] =
  useState("");

const [secondTobaccoHours, setSecondTobaccoHours] =
  useState("");

const [firstBoxes, setFirstBoxes] =
  useState("");

const [secondBoxes, setSecondBoxes] =
  useState("");

const [firstBlocks, setFirstBlocks] =
  useState("");

const [secondBlocks, setSecondBlocks] =
  useState("");

const [firstNonProfileHours, setFirstNonProfileHours] =
  useState("");

const [secondNonProfileHours, setSecondNonProfileHours] =
  useState("");
  const [firstMentorHours, setFirstMentorHours] =
  useState("");

const [secondMentorHours, setSecondMentorHours] =
  useState("");
const isTransitionDistributionValid =
  !isTransitionShift ||
  (
    transitionMode !== null &&
    Number(firstBaseHours || 0) +
      Number(secondBaseHours || 0) ===
      Number(baseHours || 0) &&

    Number(firstTobaccoHours || 0) +
      Number(secondTobaccoHours || 0) ===
      Number(tobaccoHours || 0) &&

    Number(firstBoxes || 0) +
      Number(secondBoxes || 0) ===
      Number(boxes || 0) &&

    Number(firstBlocks || 0) +
      Number(secondBlocks || 0) ===
      Number(blocks || 0) &&

    Number(firstNonProfileHours || 0) +
      Number(secondNonProfileHours || 0) ===
      Number(nonProfileHours || 0) &&

    (
      !isMentor ||
      Number(firstMentorHours || 0) +
        Number(secondMentorHours || 0) ===
        Number(salaryHours || 0)
    )
  );

const canSave =
  isTransitionDistributionValid &&
  (
    !workZone ||
    workZone === "none" ||
    (
  isMentor &&
  salaryHours !== "" &&
  nonProfileHours !== ""
) ||

    (
      workZone === "base" &&
      salaryHours !== "" &&
      baseHours !== "" &&
      boxes !== ""
    ) ||

    (
      workZone === "base_tobacco" &&
      salaryHours !== "" &&
      baseHours !== "" &&
      boxes !== "" &&
      tobaccoHours !== "" &&
      blocks !== ""
    ) ||

    (
      workZone === "tobacco" &&
      salaryHours !== "" &&
      tobaccoHours !== "" &&
      blocks !== ""
    ) ||

    (
      workZone === "warehouse" &&
      salaryHours !== ""
    )
  );
const distributeAutomatically = useCallback(() => {
  const totalHours =
    Number(salaryHours) || 0;

  if (totalHours <= 0) {
    return;
  }

  const firstHours =
    Math.min(totalHours, 4);

  const secondHours =
    Math.max(totalHours - 4, 0);

  const getFirstValue = (
    value: string
  ) => {
    const total =
      Number(value) || 0;

    if (totalHours <= 0) {
      return 0;
    }

    return Math.round(
      (total * firstHours) /
        totalHours
    );
  };

  const getSecondValue = (
    value: string,
    firstValue: number
  ) => {
    const total =
      Number(value) || 0;

    return total - firstValue;
  };

  const firstBase =
    getFirstValue(baseHours);

  const firstTobacco =
    getFirstValue(tobaccoHours);

  const firstBoxesValue =
    getFirstValue(boxes);

  const firstBlocksValue =
    getFirstValue(blocks);

  const firstNonProfile =
    getFirstValue(nonProfileHours);
  const firstMentor =
  isMentor
    ? firstHours
    : 0;

  setFirstBaseHours(
    String(firstBase)
  );

  setSecondBaseHours(
    String(
      getSecondValue(
        baseHours,
        firstBase
      )
    )
  );

  setFirstTobaccoHours(
    String(firstTobacco)
  );

  setSecondTobaccoHours(
    String(
      getSecondValue(
        tobaccoHours,
        firstTobacco
      )
    )
  );

  setFirstBoxes(
    String(firstBoxesValue)
  );

  setSecondBoxes(
    String(
      getSecondValue(
        boxes,
        firstBoxesValue
      )
    )
  );

  setFirstBlocks(
    String(firstBlocksValue)
  );

  setSecondBlocks(
    String(
      getSecondValue(
        blocks,
        firstBlocksValue
      )
    )
  );

  setFirstNonProfileHours(
    String(firstNonProfile)
  );

  setSecondNonProfileHours(
    String(
      getSecondValue(
        nonProfileHours,
        firstNonProfile
      )
    )
  );

    if (isMentor) {
    setFirstMentorHours(
      String(firstMentor)
    );

    setSecondMentorHours(
      String(secondHours)
    );
  } else {
    setFirstMentorHours("");
    setSecondMentorHours("");
  }
}, [
  salaryHours,
  baseHours,
  tobaccoHours,
  boxes,
  blocks,
  nonProfileHours,
  isMentor,
]);
useEffect(() => {
  if (
    transitionMode === "auto" &&
    isTransitionShift
  ) {
    distributeAutomatically();
  }
}, [
  transitionMode,
  isTransitionShift,
  distributeAutomatically,
]);
function clearTransitionDistribution() {
  setTransitionMode(null);

  setFirstBaseHours("");
  setSecondBaseHours("");

  setFirstTobaccoHours("");
  setSecondTobaccoHours("");

  setFirstBoxes("");
  setSecondBoxes("");

  setFirstBlocks("");
  setSecondBlocks("");

  setFirstNonProfileHours("");
  setSecondNonProfileHours("");

  setFirstMentorHours("");
  setSecondMentorHours("");
}
function clearWorkData() {
  setSalaryHours("");
  setBaseHours("");
  setTobaccoHours("");
  setBoxes("");
  setBlocks("");
  setNonProfileHours("");

  setIsMentor(false);

  clearTransitionDistribution();
}
    useEffect(() => {
  if (!selectedDate) return;

  const selectedDay = new Date(selectedDate);
  selectedDay.setHours(0, 0, 0, 0);

  const currentShift = shifts.find((shift) => {
    const shiftDate = new Date(shift.date);
    shiftDate.setHours(0, 0, 0, 0);

    return (
      shiftDate.getTime() === selectedDay.getTime()
    );
  });

  if (!currentShift) {
  setDayType("off");
  setShiftTime("");
  setWorkZone("none");

  setSalaryHours("");
  setBaseHours("");
  setTobaccoHours("");
  setBoxes("");
  setBlocks("");
  setNonProfileHours("");

  setIsMentor(false);

  clearTransitionDistribution();

  return;
}

if (currentShift.status === "vacation") {
    setDayType("vacation");
  } else if (currentShift.status === "sick") {
    setDayType("sick");
  } else if (currentShift.status === "absence") {
    setDayType("absence");
  } else if (currentShift.status === "dayOff") {
    setDayType("do");
  } else if (currentShift.workType === "extra") {
    setDayType("extra");
  } else if (currentShift.workType === "overtime") {
    setDayType("overtime");
  } else if (currentShift.workType === "main") {
    setDayType("main");
  } else {
    setDayType("off");
  }

  if (
    currentShift.type === "day" ||
    currentShift.type === "night"
  ) {
    setShiftTime(currentShift.type);
  } else {
    setShiftTime("");
  }
  setWorkZone(currentShift.workZone ?? "none");
  setSalaryHours(
    currentShift.salaryHours ? String(currentShift.salaryHours) : ""
  );
  setBaseHours(
    currentShift.baseHours ? String(currentShift.baseHours) : ""
  );
  setBoxes(
    currentShift.boxes ? String(currentShift.boxes) : ""
  );
  setTobaccoHours(
    currentShift.tobaccoHours ? String(currentShift.tobaccoHours) : ""
  );
  setBlocks(
    currentShift.blocks ? String(currentShift.blocks) : ""
  );
  setNonProfileHours(
    currentShift.nonProfileHours
      ? String(currentShift.nonProfileHours)
      : ""
  );
    setIsMentor(currentShift.mentor ?? false);

  if (currentShift.transitionDistribution) {
    const distribution =
      currentShift.transitionDistribution;

    setTransitionMode(distribution.mode);

    setFirstBaseHours(
      distribution.firstMonth.baseHours
        ? String(
            distribution.firstMonth.baseHours
          )
        : ""
    );

    setSecondBaseHours(
      distribution.secondMonth.baseHours
        ? String(
            distribution.secondMonth.baseHours
          )
        : ""
    );

    setFirstTobaccoHours(
      distribution.firstMonth.tobaccoHours
        ? String(
            distribution.firstMonth.tobaccoHours
          )
        : ""
    );

    setSecondTobaccoHours(
      distribution.secondMonth.tobaccoHours
        ? String(
            distribution.secondMonth.tobaccoHours
          )
        : ""
    );

    setFirstBoxes(
      distribution.firstMonth.boxes
        ? String(
            distribution.firstMonth.boxes
          )
        : ""
    );

    setSecondBoxes(
      distribution.secondMonth.boxes
        ? String(
            distribution.secondMonth.boxes
          )
        : ""
    );

    setFirstBlocks(
      distribution.firstMonth.blocks
        ? String(
            distribution.firstMonth.blocks
          )
        : ""
    );

    setSecondBlocks(
      distribution.secondMonth.blocks
        ? String(
            distribution.secondMonth.blocks
          )
        : ""
    );

    setFirstNonProfileHours(
      distribution.firstMonth.nonProfileHours
        ? String(
            distribution.firstMonth.nonProfileHours
          )
        : ""
    );

    setSecondNonProfileHours(
      distribution.secondMonth.nonProfileHours
        ? String(
            distribution.secondMonth.nonProfileHours
          )
        : ""
    );

    setFirstMentorHours(
      distribution.firstMonth.mentorHours
        ? String(
            distribution.firstMonth.mentorHours
          )
        : ""
    );

    setSecondMentorHours(
      distribution.secondMonth.mentorHours
        ? String(
            distribution.secondMonth.mentorHours
          )
        : ""
    );
  } else {
  setTransitionMode(null);

    setFirstBaseHours("");
    setSecondBaseHours("");

    setFirstTobaccoHours("");
    setSecondTobaccoHours("");

    setFirstBoxes("");
    setSecondBoxes("");

    setFirstBlocks("");
    setSecondBlocks("");

    setFirstNonProfileHours("");
    setSecondNonProfileHours("");

    setFirstMentorHours("");
    setSecondMentorHours("");
  }

  setIsDayTypeOpen(false);
  setIsWorkZoneOpen(false);
}, [selectedDate, shifts]);
async function saveShift() {
  if (!selectedDate || !currentUserId) {
    return false;
  }

  const dateToSave = selectedDate;

  async function persistShift(
    data: Parameters<typeof updateShift>[1]
  ) {
    try {
      const response = await fetch("/api/schedule", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: currentUserId,
          date: dateToSave.toISOString(),
          ...data,
        }),
      });

      if (!response.ok) {
        alert("Не удалось сохранить смену");

        return false;
      }

      updateShift(dateToSave, data);

      return true;
    } catch (error) {
      console.error(
        "Ошибка сохранения смены:",
        error
      );

      alert("Не удалось сохранить смену");

      return false;
    }
  }

  if (["main", "overtime", "extra"].includes(dayType)) {
    if (
      shiftTime !== "day" &&
      shiftTime !== "night"
    ) {
      return false;
    }

    return await persistShift({
      type: shiftTime,

      workType:
        dayType === "overtime"
          ? "overtime"
          : dayType === "extra"
          ? "extra"
          : "main",

      status: "none",

      workZone:
        workZone === ""
          ? "none"
          : workZone,

      salaryHours:
        Number(salaryHours) || 0,

      baseHours:
        Number(baseHours) || 0,

      tobaccoHours:
        Number(tobaccoHours) || 0,

      boxes:
        Number(boxes) || 0,

      blocks:
        Number(blocks) || 0,

      nonProfileHours:
        Number(nonProfileHours) || 0,

      mentor: isMentor,

      transitionDistribution:
        isTransitionShift &&
        transitionMode !== null
          ? {
              mode: transitionMode,

              firstMonth: {
                baseHours:
                  Number(firstBaseHours) || 0,

                tobaccoHours:
                  Number(firstTobaccoHours) || 0,

                boxes:
                  Number(firstBoxes) || 0,

                blocks:
                  Number(firstBlocks) || 0,

                nonProfileHours:
                  Number(firstNonProfileHours) || 0,

                mentorHours:
                  Number(firstMentorHours) || 0,
              },

              secondMonth: {
                baseHours:
                  Number(secondBaseHours) || 0,

                tobaccoHours:
                  Number(secondTobaccoHours) || 0,

                boxes:
                  Number(secondBoxes) || 0,

                blocks:
                  Number(secondBlocks) || 0,

                nonProfileHours:
                  Number(secondNonProfileHours) || 0,

                mentorHours:
                  Number(secondMentorHours) || 0,
              },
            }
          : undefined,

      isWorked:
        workZone !== "" &&
        workZone !== "none",
    });
  }

  if (dayType === "off") {
    return await persistShift({
      type: "off",
      workType: null,
      status: "none",

      workZone: "none",

      salaryHours: 0,
      baseHours: 0,
      tobaccoHours: 0,

      boxes: 0,
      blocks: 0,
      nonProfileHours: 0,

      mentor: false,

      isWorked: false,
    });
  }

  if (
    dayType === "do" ||
    dayType === "absence" ||
    dayType === "sick"
  ) {
    return await persistShift({
      type: "off",

      workType: dayType,

      status:
        dayType === "do"
          ? "dayOff"
          : dayType === "absence"
          ? "absence"
          : "sick",

      workZone: "none",

      salaryHours: 0,
      baseHours: 0,
      tobaccoHours: 0,

      boxes: 0,
      blocks: 0,
      nonProfileHours: 0,

      mentor: false,

      isWorked: false,
    });
  }

  if (dayType === "vacation") {
    return await persistShift({
      type: "vacation",
      workType: "vacation",
      status: "vacation",

      workZone: "none",

      salaryHours: 0,
      baseHours: 0,
      tobaccoHours: 0,

      boxes: 0,
      blocks: 0,
      nonProfileHours: 0,

      mentor: false,

      isWorked: false,
    });
  }

  return false;
}
function handleMentorChange(checked: boolean) {
  setIsMentor(checked);

  clearTransitionDistribution();

  if (checked) {
    setSalaryHours("11");
    setNonProfileHours("11");

    setBaseHours("");
    setBoxes("");

    if (isTransitionShift) {
      setTransitionMode("auto");

      setFirstNonProfileHours("4");
      setSecondNonProfileHours("7");

      setFirstMentorHours("4");
      setSecondMentorHours("7");
    }
  } else {
    setSalaryHours("");
    setNonProfileHours("");

    setBaseHours("");
    setBoxes("");
  }
}
    if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.sheet}>
        <div className={styles.handle} />

        <div className={styles.header}>
  <button
  type="button"
  className={styles.headerAction}
  onClick={() => {
  if (selectedDate) {
    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);

    const currentShift = shifts.find((shift) => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(0, 0, 0, 0);

      return shiftDate.getTime() === selectedDay.getTime();
    });

    if (currentShift) {
      if (currentShift.status === "vacation") {
        setDayType("vacation");
      } else if (currentShift.status === "sick") {
        setDayType("sick");
      } else if (currentShift.status === "absence") {
        setDayType("absence");
      } else if (currentShift.status === "dayOff") {
        setDayType("do");
      } else if (currentShift.workType === "extra") {
        setDayType("extra");
      } else if (currentShift.workType === "overtime") {
        setDayType("overtime");
      } else if (currentShift.workType === "main") {
        setDayType("main");
      } else {
        setDayType("off");
      }

      setShiftTime(
        currentShift.type === "day" ||
          currentShift.type === "night"
          ? currentShift.type
          : ""
      );

      setWorkZone(currentShift.workZone ?? "none");

      setSalaryHours(
        currentShift.salaryHours
          ? String(currentShift.salaryHours)
          : ""
      );

      setBaseHours(
        currentShift.baseHours
          ? String(currentShift.baseHours)
          : ""
      );

      setBoxes(
        currentShift.boxes
          ? String(currentShift.boxes)
          : ""
      );

      setTobaccoHours(
        currentShift.tobaccoHours
          ? String(currentShift.tobaccoHours)
          : ""
      );

      setBlocks(
        currentShift.blocks
          ? String(currentShift.blocks)
          : ""
      );

      setNonProfileHours(
        currentShift.nonProfileHours
          ? String(currentShift.nonProfileHours)
          : ""
      );

      setIsMentor(currentShift.mentor ?? false);
    }
  }

  setIsDayTypeOpen(false);
  setIsWorkZoneOpen(false);
  onClose();
}}
>
  Отмена
</button>

  <h2 className={styles.title}>
    Данные смены
  </h2>

  <button
  type="button"
  className={styles.headerAction}
  onClick={async () => {
  const isSaved = await saveShift();

  if (isSaved) {
    onClose();
  }
}}
disabled={!canSave}
>
  Сохранить
</button>
</div>

<div className={styles.dateBlock}>
  <div className={styles.dateValue}>
    {selectedDate?.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}
  </div>
  <div className={styles.dateWeekday}>
    {selectedDate?.toLocaleDateString("ru-RU", {
      weekday: "long",
    })}
  </div>
</div>

<div className={styles.content}>
  <label className={styles.label}>
  Тип дня
</label>

<div className={styles.selectWrapper}>
<button
  type="button"
  className={styles.selectButton}
  onClick={() => {
  setIsDayTypeOpen(!isDayTypeOpen);
  setIsWorkZoneOpen(false);
}}
>
  <span className={styles.selectValue}>
    {dayType === "main" && "Основная смена"}
{dayType === "extra" && "Подработка"}
{dayType === "overtime" && "Отработка"}
    {dayType === "off" && "Выходной"}
    {dayType === "do" && "ДО"}
    {dayType === "vacation" && "Отпуск"}
    {dayType === "sick" && "Больничный"}
    {dayType === "absence" && "Прогул"}
    {!dayType && "Выберите тип дня"}
  </span>

  <span className={styles.selectArrow}>▾</span>
</button>

{isDayTypeOpen && (
  <div className={styles.dropdown}>
    <button
      type="button"
      onClick={() => {
        setDayType("main");
        setWorkZone("none");
clearWorkData();
        setIsDayTypeOpen(false);
      }}
    >
      Основная смена (ОСН)
    </button>

      <button
  type="button"
  onClick={() => {
    setDayType("extra");
    setIsDayTypeOpen(false);
  }}
>
  Подработка (ДОП)
</button>

<button
  type="button"
  onClick={() => {
    setDayType("overtime");
    setIsDayTypeOpen(false);
  }}
>
  Отработка (ОТР)
</button>

    <button
      type="button"
      onClick={() => {
        setDayType("off");
        setWorkZone("none");
clearWorkData();
        setIsDayTypeOpen(false);
      }}
    >
      Выходной
    </button>

    <button
      type="button"
      onClick={() => {
        setDayType("do");
        setWorkZone("none");
clearWorkData();
        setIsDayTypeOpen(false);
      }}
    >
      День отдыха (ДО)
    </button>

    <button
      type="button"
      onClick={() => {
        setDayType("vacation");
        setWorkZone("none");
clearWorkData();
        setIsDayTypeOpen(false);
      }}
    >
      Отпуск (ОТП)
    </button>

    <button
      type="button"
      onClick={() => {
        setDayType("sick");
        setWorkZone("none");
clearWorkData();
        setIsDayTypeOpen(false);
      }}
    >
      Больничный (БЛ)
    </button>

    <button
      type="button"
      onClick={() => {
        setDayType("absence");
        setWorkZone("none");
clearWorkData();
        setIsDayTypeOpen(false);
      }}
    >
      Прогул (ПРГ)
    </button>
  </div>
)}
</div>

{["main", "overtime", "extra"].includes(dayType) && (
  <>
    <div className={styles.radioGroup}>
  <label className={styles.radioItem}>
    <input
      type="radio"
      name="shiftTime"
      checked={shiftTime === "day"}
      onChange={() => setShiftTime("day")}
    />
    <span>Дневная</span>
  </label>

  <label className={styles.radioItem}>
    <input
      type="radio"
      name="shiftTime"
      checked={shiftTime === "night"}
      onChange={() => setShiftTime("night")}
    />
    <span>Ночная</span>
  </label>
</div>

    <label className={styles.label}>
  Тип работы
</label>

<div className={styles.selectWrapper}>
  <button
    type="button"
    className={styles.selectButton}
    onClick={() => {
  setIsWorkZoneOpen(!isWorkZoneOpen);
  setIsDayTypeOpen(false);
}}
  >
    <span className={styles.selectValue}>
      {workZone === "none" && "—"}
{workZone === "base" && "Основа"}
{workZone === "base_tobacco" && "Основа + Табак"}
{workZone === "tobacco" && "Табак"}
{workZone === "warehouse" && "Работа по складу"}
{!workZone && "Выберите зону"}
    </span>

    <span className={styles.selectArrow}>▾</span>
  </button>

  {isWorkZoneOpen && (
    <div className={styles.dropdown}>
      <button
  type="button"
  onClick={() => {
  setWorkZone("none");
  clearWorkData();
  setIsWorkZoneOpen(false);
}}
>
  —
</button>
      <button
        type="button"
        onClick={() => {
  setWorkZone("base");
  clearWorkData();
  setIsWorkZoneOpen(false);
}}
      >
        Основа
      </button>

      <button
        type="button"
        onClick={() => {
  setWorkZone("base_tobacco");
  clearWorkData();
  setIsWorkZoneOpen(false);
}}
      >
        Основа + Табак
      </button>

      <button
        type="button"
        onClick={() => {
  setWorkZone("tobacco");
  clearWorkData();
  setIsWorkZoneOpen(false);
}}
      >
        Табак
      </button>

      <button
        type="button"
        onClick={() => {
  setWorkZone("warehouse");
  clearWorkData();
  setIsWorkZoneOpen(false);
}}
      >
        Работа по складу
      </button>
    </div>
  )}
</div>

{workZone !== "none" && workZone && (
  <input
    type="number"
    className={styles.input}
    placeholder="Часы по окладу"
    value={salaryHours}
    onChange={(e) => setSalaryHours(e.target.value)}
    disabled={isMentor}
  />
)}

{workZone === "base" && (
  <>
    <input
      type="number"
      className={styles.input}
      placeholder="Основа часы"
      value={baseHours}
      onChange={(e) => setBaseHours(e.target.value)}
      disabled={isMentor}
    />

    <input
      type="number"
      className={styles.input}
      placeholder="Коробки"
      value={boxes}
      onChange={(e) => setBoxes(e.target.value)}
      disabled={isMentor}
    />

    <input
  type="number"
  className={styles.input}
  placeholder="Непрофильные часы"
  value={nonProfileHours}
  onChange={(e) => setNonProfileHours(e.target.value)}
  disabled={isMentor}
/>

<label className={styles.radioItem}>
  <span>Наставник</span>

  <input
    type="checkbox"
    checked={isMentor}
    onChange={(e) => handleMentorChange(e.target.checked)}
  />
</label>
  </>
)}

{workZone === "base_tobacco" && (
  <>
    <input
      type="number"
      className={styles.input}
      placeholder="Основа часы"
      value={baseHours}
      onChange={(e) => setBaseHours(e.target.value)}
    />

    <input
      type="number"
      className={styles.input}
      placeholder="Коробки"
      value={boxes}
      onChange={(e) => setBoxes(e.target.value)}
    />

    <input
      type="number"
      className={styles.input}
      placeholder="Табак часы"
      value={tobaccoHours}
      onChange={(e) => setTobaccoHours(e.target.value)}
    />

    <input
      type="number"
      className={styles.input}
      placeholder="Блоки"
      value={blocks}
      onChange={(e) => setBlocks(e.target.value)}
    />

    <input
      type="number"
      className={styles.input}
      placeholder="Непрофильные часы"
      value={nonProfileHours}
      onChange={(e) => setNonProfileHours(e.target.value)}
    />
  </>
)}

{workZone === "tobacco" && (
  <>
    <input
      type="number"
      className={styles.input}
      placeholder="Табак часы"
      value={tobaccoHours}
      onChange={(e) => setTobaccoHours(e.target.value)}
    />

    <input
      type="number"
      className={styles.input}
      placeholder="Блоки"
      value={blocks}
      onChange={(e) => setBlocks(e.target.value)}
    />

    <input
      type="number"
      className={styles.input}
      placeholder="Непрофильные часы"
      value={nonProfileHours}
      onChange={(e) => setNonProfileHours(e.target.value)}
    />
  </>
)}

{workZone === "warehouse" && (
  <input
    type="number"
    className={styles.input}
    placeholder="Непрофильные часы"
    value={nonProfileHours}
    onChange={(e) =>
      setNonProfileHours(
        e.target.value
      )
    }
  />
)}

{isTransitionShift && (
    <div>
      <label className={styles.label}>
        Распределение переходящей смены
      </label>

      <div className={styles.radioGroup}>
        {!isMentor && (
  <label className={styles.radioItem}>
    <input
      type="radio"
      name="transitionMode"
      checked={
        transitionMode === "manual"
      }
      onChange={() => {
        clearTransitionDistribution();

        setTransitionMode("manual");
      }}
    />

    <span>
      Ручной ввод
    </span>
  </label>
)}

        {workZone !== "base_tobacco" && (
  <label className={styles.radioItem}>
    <input
      type="radio"
      name="transitionMode"
      checked={
        transitionMode === "auto"
      }
      onChange={() => {
        clearTransitionDistribution();

        setTransitionMode("auto");

        distributeAutomatically();
      }}
    />

    <span>
      Автоматически
    </span>
  </label>
)}
            </div>

      {transitionMode !== null && (
  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "minmax(0, 1fr) minmax(0, 1fr)",
      gap: "8px",
      alignItems: "start",
    }}
  >
    <div>
      <label className={styles.label}>
            {firstTransitionDate?.toLocaleDateString(
          "ru-RU",
          {
            day: "numeric",
            month: "long",
          }
        )}

        {" — "}

        {firstMonthSalaryHours}

        {" ч."}
      </label>

      {workZone === "base" && (
        <>
          <input
            type="number"
            className={styles.input}
            placeholder="Основа часы"
value={firstBaseHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setFirstBaseHours(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Коробки"
value={firstBoxes}
disabled={transitionMode === "auto"}
            onChange={(e) =>
              setFirstBoxes(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Непрофильные часы"
value={firstNonProfileHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setFirstNonProfileHours(
                e.target.value
              )
            }
          />
        </>
      )}

      {workZone === "base_tobacco" && (
        <>
          <input
            type="number"
            className={styles.input}
            placeholder="Основа часы"
            value={firstBaseHours}
disabled={transitionMode === "auto"}
            onChange={(e) =>
              setFirstBaseHours(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Коробки"
            value={firstBoxes}
disabled={transitionMode === "auto"}
            onChange={(e) =>
              setFirstBoxes(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Табак часы"
value={firstTobaccoHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setFirstTobaccoHours(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Блоки"
value={firstBlocks}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setFirstBlocks(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Непрофильные часы"
value={firstNonProfileHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setFirstNonProfileHours(
                e.target.value
              )
            }
          />
        </>
      )}

      {workZone === "tobacco" && (
        <>
          <input
            type="number"
            className={styles.input}
            placeholder="Табак часы"
value={firstTobaccoHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setFirstTobaccoHours(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Блоки"
value={firstBlocks}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setFirstBlocks(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Непрофильные часы"
value={firstNonProfileHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setFirstNonProfileHours(
                e.target.value
              )
            }
          />
        </>
      )}
{workZone === "warehouse" && (
  <input
    type="number"
    className={styles.input}
    placeholder="Непрофильные часы"
value={firstNonProfileHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
      setFirstNonProfileHours(
        e.target.value
      )
    }
  />
)}

{isMentor && (
  <input
    type="number"
    className={styles.input}
    placeholder="Наставник часы"
    value={firstMentorHours}
    disabled={transitionMode === "auto"}
    onChange={(e) =>
      setFirstMentorHours(
        e.target.value
      )
    }
  />
)}

    </div>

    <div>
      <label className={styles.label}>
        {secondTransitionDate?.toLocaleDateString(
          "ru-RU",
          {
            day: "numeric",
            month: "long",
          }
        )}

        {" — "}

        {secondMonthSalaryHours}

        {" ч."}
      </label>

      {workZone === "base" && (
        <>
          <input
            type="number"
            className={styles.input}
            placeholder="Основа часы"
            value={secondBaseHours}
disabled={transitionMode === "auto"}
            onChange={(e) =>
              setSecondBaseHours(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Коробки"
            value={secondBoxes}
disabled={transitionMode === "auto"}
            onChange={(e) =>
              setSecondBoxes(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Непрофильные часы"
value={secondNonProfileHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setSecondNonProfileHours(
                e.target.value
              )
            }
          />
        </>
      )}

      {workZone === "base_tobacco" && (
        <>
          <input
            type="number"
            className={styles.input}
            placeholder="Основа часы"
            value={secondBaseHours}
disabled={transitionMode === "auto"}
            onChange={(e) =>
              setSecondBaseHours(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Коробки"
            value={secondBoxes}
disabled={transitionMode === "auto"}
            onChange={(e) =>
              setSecondBoxes(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Табак часы"
value={secondTobaccoHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setSecondTobaccoHours(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Блоки"
value={secondBlocks}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setSecondBlocks(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Непрофильные часы"
value={secondNonProfileHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setSecondNonProfileHours(
                e.target.value
              )
            }
          />
        </>
      )}

      {workZone === "tobacco" && (
        <>
          <input
            type="number"
            className={styles.input}
            placeholder="Табак часы"
value={secondTobaccoHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setSecondTobaccoHours(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
           placeholder="Блоки"
value={secondBlocks}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setSecondBlocks(
                e.target.value
              )
            }
          />

          <input
            type="number"
            className={styles.input}
            placeholder="Непрофильные часы"
value={secondNonProfileHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
              setSecondNonProfileHours(
                e.target.value
              )
            }
          />
        </>
      )}
{workZone === "warehouse" && (
  <input
    type="number"
    className={styles.input}
    placeholder="Непрофильные часы"
value={secondNonProfileHours}
disabled={transitionMode === "auto"}
onChange={(e) =>
      setSecondNonProfileHours(
        e.target.value
      )
    }
  />
)}

{isMentor && (
  <input
    type="number"
    className={styles.input}
    placeholder="Наставник часы"
    value={secondMentorHours}
disabled={transitionMode === "auto"}
    onChange={(e) =>
      setSecondMentorHours(
        e.target.value
      )
    }
  />
)}

    </div>
  </div>
)}
    </div>
  )}

  </>
  
)}
</div>
      </div>
    </div>
  );
}
