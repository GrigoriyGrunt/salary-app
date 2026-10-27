"use client";

import PageHeader from "@/components/PageHeader/PageHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import PeriodPicker from "@/components/statistics/PeriodPicker/PeriodPicker";
import { useEffect, useState } from "react";
import { useUsersStore } from "@/store/usersStore";
import MonthSummary from "@/components/statistics/MonthSummary/MonthSummary";
import AverageStats from "@/components/statistics/AverageStats/AverageStats";
import DailyStatistics from "@/components/statistics/DailyStatistics/DailyStatistics";
import WorkHours from "@/components/statistics/WorkHours/WorkHours";
import MentorStats from "@/components/statistics/MentorStats/MentorStats";
import styles from "./page.module.css";

export default function StatisticsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const currentUser = useUsersStore(
    (state) => state.currentUser
  );
    const [showStatisticsGuide, setShowStatisticsGuide] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;

    const key = `statistics-guide-shown-${currentUser.id}`;

    if (localStorage.getItem(key) !== "true") {
      localStorage.setItem(key, "true");
      setShowStatisticsGuide(true);
    }
  }, [currentUser?.id]);

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
/>
<MonthSummary selectedDate={selectedDate} />

<AverageStats selectedDate={selectedDate} />

<DailyStatistics
  selectedDate={selectedDate}
  onChange={setSelectedDate}
/>

<WorkHours selectedDate={selectedDate} />

{!isTobaccoPicker && !isStacker && (
  <MentorStats selectedDate={selectedDate} />
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