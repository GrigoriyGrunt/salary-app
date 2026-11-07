"use client";

import PageHeader from "@/components/PageHeader/PageHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import PeriodPicker from "@/components/statistics/PeriodPicker/PeriodPicker";
import { useEffect, useMemo, useState } from "react";
import { useUsersStore } from "@/store/usersStore";
import MonthSummary from "@/components/statistics/MonthSummary/MonthSummary";
import AverageStats from "@/components/statistics/AverageStats/AverageStats";
import DailyStatistics from "@/components/statistics/DailyStatistics/DailyStatistics";
import WorkHours from "@/components/statistics/WorkHours/WorkHours";
import MentorStats from "@/components/statistics/MentorStats/MentorStats";
import styles from "./page.module.css";
function toDateKey(value: Date | string | null | undefined) {
  if (!value) return null;

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const dateKey = String(value).slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
    ? dateKey
    : null;
}
export default function StatisticsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const currentUser = useUsersStore(
    (state) => state.currentUser
  );
  const isWatchEmployee =
  currentUser?.position === "Комплектовщик основы" &&
  currentUser?.schedule === "15/15 вахта";

const watchPeriods = useMemo(() => {
  if (!isWatchEmployee || !currentUser) return [];

  const periods = [
    {
      startDate: toDateKey(currentUser.firstShiftDate),
      endDate: toDateKey(currentUser.secondShiftDate),
    },
    ...(currentUser.scheduleChanges ?? [])
      .filter((change) => change.schedule === "15/15 вахта")
      .map((change) => ({
        startDate: toDateKey(change.firstShiftDate),
        endDate: toDateKey(change.secondShiftDate),
      })),
  ].filter(
    (period): period is { startDate: string; endDate: string } =>
      Boolean(
        period.startDate &&
        period.endDate &&
        period.endDate >= period.startDate
      )
  );

  return Array.from(
    new Map(
      periods.map((period) => [
        `${period.startDate}_${period.endDate}`,
        period,
      ])
    ).values()
  ).sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );
}, [currentUser, isWatchEmployee]);

const [selectedWatchPeriodIndex, setSelectedWatchPeriodIndex] =
  useState(0);

useEffect(() => {
  if (!isWatchEmployee || watchPeriods.length === 0) return;

  const today = toDateKey(new Date())!;

  const completedPeriods = watchPeriods.filter(
    (period) => period.endDate < today
  );

  let index: number;

  if (completedPeriods.length > 0) {
    index = watchPeriods.indexOf(
      completedPeriods[completedPeriods.length - 1]
    );
  } else {
    const nearestPeriod = watchPeriods.findIndex(
      (period) => period.endDate >= today
    );

    index = nearestPeriod >= 0 ? nearestPeriod : 0;
  }

  setSelectedWatchPeriodIndex(index);
  setSelectedDate(
    new Date(`${watchPeriods[index].startDate}T00:00:00`)
  );
}, [isWatchEmployee, watchPeriods]);

const handleWatchPeriodChange = (index: number) => {
  const period = watchPeriods[index];

  if (!period) return;

  setSelectedWatchPeriodIndex(index);
  setSelectedDate(
    new Date(`${period.startDate}T00:00:00`)
  );
};

const selectedWatchPeriod =
  isWatchEmployee && watchPeriods.length > 0
    ? watchPeriods[selectedWatchPeriodIndex]
    : undefined;
    const [showStatisticsGuide, setShowStatisticsGuide] = useState(false);

    useEffect(() => {
    if (!currentUser?.id || !currentUser.isSetupCompleted) return;

    const key = `statistics-guide-shown-${currentUser.id}`;

    if (localStorage.getItem(key) !== "true") {
      localStorage.setItem(key, "true");
      setShowStatisticsGuide(true);
    }
  }, [currentUser?.id, currentUser?.isSetupCompleted]);

  const isTobaccoPicker =
  currentUser?.position === "Комплектовщик табака";

const isStacker =
  currentUser?.position ===
  "Штабелер (водитель погрузчика)";
  return (
    <main className={styles.page}>
      <PageHeader title="Статистика" />

      <div className={styles.content}>
        <div className={styles.scrollContent}>
<PeriodPicker
  selectedDate={selectedDate}
  onChange={setSelectedDate}
  watchPeriods={
    isWatchEmployee && watchPeriods.length > 0
      ? watchPeriods
      : undefined
  }
  selectedWatchPeriodIndex={
    isWatchEmployee && watchPeriods.length > 0
      ? selectedWatchPeriodIndex
      : undefined
  }
  onWatchPeriodChange={
    isWatchEmployee && watchPeriods.length > 0
      ? handleWatchPeriodChange
      : undefined
  }
/>
<MonthSummary
  selectedDate={selectedDate}
  watchPeriod={selectedWatchPeriod}
/>

<AverageStats
  selectedDate={selectedDate}
  watchPeriod={selectedWatchPeriod}
/>

<DailyStatistics
  selectedDate={selectedDate}
  onChange={setSelectedDate}
  watchPeriod={selectedWatchPeriod}
/>

<WorkHours
  selectedDate={selectedDate}
  watchPeriod={selectedWatchPeriod}
/>

{!isTobaccoPicker && !isStacker && (
  <MentorStats
  selectedDate={selectedDate}
  watchPeriod={selectedWatchPeriod}
/>
)}
        </div>
      </div>
      {showStatisticsGuide && (
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
              Это раздел «Статистика». Здесь подробно представлена ваша
              выработка за выбранный период: результаты по часам и выработка
              с учётом вашей системы мотивации.
            </p>

            <button
              onClick={() => setShowStatisticsGuide(false)}
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