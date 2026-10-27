"use client";

import { useEffect, useState } from "react";
import { useUsersStore } from "@/store/usersStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useShiftEditor } from "@/components/common/ShiftEditorProvider/ShiftEditorProvider";
import styles from "./page.module.css";
import PageHeader from "@/components/PageHeader/PageHeader";
import MonthCalendar from "@/components/schedule/MonthCalendar/MonthCalendar";
import TodayCard from "@/components/home/week/TodayCard";
import MonthSummary from "@/components/schedule/MonthSummary/MonthSummary";
import PeriodActions from "@/components/schedule/PeriodActions/PeriodActions";
import PeriodModal from "@/components/schedule/PeriodModal/PeriodModal";
import BottomNavigation from "@/components/navigation/BottomNavigation";

export default function SchedulePage() {
  const [currentMonthDate, setCurrentMonthDate] = useState(
  new Date()
);
  const currentUser = useUsersStore(
    (state) => state.currentUser
  );

  const [showScheduleGuide, setShowScheduleGuide] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;

    const key = `schedule-guide-shown-${currentUser.id}`;

    if (localStorage.getItem(key) !== "true") {
      localStorage.setItem(key, "true");
      setShowScheduleGuide(true);
    }
  }, [currentUser?.id]);
  const {
  openShiftEditor,
  selectedDate,
  openTodayShiftEditor,
  openChangeSchedule,
} = useShiftEditor();

const [periodType, setPeriodType] = useState<"vacation" | "sick" | null>(null);
const updateShift = useScheduleStore(
  (state) => state.updateShift
);
const syncSchedule = useScheduleStore(
  (state) => state.syncSchedule
);

const handlePeriodSave = (
  startDate: Date,
  endDate: Date,
  type: "vacation" | "sick",
  vacationType?: "annual" | "unpaid"
) => {
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
if (type === "sick") {
  updateShift(new Date(currentDate), {
    type: "off",
    workType: "sick",
    status: "sick",

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

if (type === "vacation") {
  if (vacationType === "annual") {
    updateShift(new Date(currentDate), {
      type: "off",
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

  if (vacationType === "unpaid") {
    updateShift(new Date(currentDate), {
      type: "off",
      workType: "do",
      status: "dayOff",

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
}

    currentDate.setDate(
      currentDate.getDate() + 1
    );
  }

  void syncSchedule();

  setPeriodType(null);
};
  return (
    <main className={styles.page}>
        <PageHeader title="График" />

<div className={styles.content}>
  <div className={styles.scrollContent}>

    <MonthCalendar
  currentDate={currentMonthDate}
  onMonthChange={setCurrentMonthDate}
/>
  <div className={styles.contentWrapper}>
    <button
  className={styles.addDataButton}
  onClick={() => {
  if (selectedDate) {
    openShiftEditor(selectedDate);
  }
}}
>
  Внести или редактировать данные
</button>

<PeriodActions
  onVacationClick={() => setPeriodType("vacation")}
  onSickClick={() => setPeriodType("sick")}
/>
<button
  type="button"
  className={styles.addDataButton}
  onClick={openChangeSchedule}
>
  Изменить график
</button>
<PeriodModal
  open={periodType !== null}
  title={
    periodType === "vacation"
      ? "Введите период отпуска"
      : "Введите период больничного"
  }
  type={periodType}
  onSave={handlePeriodSave}
  onClose={() => setPeriodType(null)}
/>
    <div className={styles.todayCardWrapper}>
  <TodayCard onOpenSheet={openTodayShiftEditor} />
</div>

<MonthSummary currentDate={currentMonthDate} />
  </div>
  </div>
</div>
      {showScheduleGuide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(0, 0, 0, 0.65)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              padding: 24,
              borderRadius: 20,
              background: "#ffffff",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.45,
                color: "#222222",
              }}
            >
              Это раздел «График». Здесь вы можете вносить и редактировать
              данные любой смены, изменять график работы и просматривать
              общую информацию об отработанных сменах.
            </p>

            <button
              onClick={() => setShowScheduleGuide(false)}
              style={{
                width: "100%",
                padding: "12px 8px",
                border: 0,
                borderRadius: 12,
                background: "#b5121b",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              ОК
            </button>
          </div>
        </div>
      )}
<BottomNavigation />
    </main>
  );
}
