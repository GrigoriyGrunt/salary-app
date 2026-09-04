"use client";

import styles from "./page.module.css";
import WeekSection from "@/components/home/week/WeekSection";

import PageHeader from "@/components/PageHeader/PageHeader";
import TopStats from "@/components/home/TopStats";
import SalaryCard from "@/components/home/SalaryCard";
import MotivationSection from "@/components/home/motivation/MotivationSection";
import ActionsSection from "@/components/home/actions/ActionsSection";
import BottomNavigation from "@/components/navigation/BottomNavigation";

export default function Page() {

  return (
    <main className={styles.page}>
  <div className={styles.container}>

    <div className={styles.header}>
  <PageHeader
  title="Главная"
  variant="home"
/>
</div>

    <div className={styles.content}>
      <TopStats />
      <SalaryCard />
      <WeekSection />
      <MotivationSection />
      <ActionsSection />
    </div>

    <div className={styles.navigation}>
      <BottomNavigation />
    </div>

  </div>
</main>
  );
}