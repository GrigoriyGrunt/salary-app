"use client";

import PageHeader from "@/components/PageHeader/PageHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import PeriodPicker from "@/components/statistics/PeriodPicker/PeriodPicker";
import { useState } from "react";
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

  const isTobaccoPicker =
    currentUser?.position === "Комплектовщик табака";
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

{!isTobaccoPicker && (
  <MentorStats selectedDate={selectedDate} />
)}
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}