"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import PageHeader from "@/components/PageHeader/PageHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import PeriodPicker from "@/components/statistics/PeriodPicker/PeriodPicker";

import CurrentSalary from "@/components/money/CurrentSalary/CurrentSalary";
import Payments from "@/components/money/Payments/Payments";
import Deductions from "@/components/money/Deductions/Deductions";
import styles from "./page.module.css";
import SalaryBreakdown from "@/components/money/SalaryBreakdown/SalaryBreakdown";
import DailyStatistics from "@/components/statistics/DailyStatistics/DailyStatistics";
import { useFinanceStore } from "@/store/financeStore";

export default function MoneyPage() {
  const searchParams =
    useSearchParams();

  const requestedMonth =
    searchParams.get("month");

  const requestedPaymentType =
    searchParams.get("paymentType");

  const requestedPaymentDate =
    searchParams.get("paymentDate");

  const getDateFromMonthKey = (
    monthKey: string | null
  ) => {
    if (
      !monthKey ||
      !/^\d{4}-\d{2}$/.test(
        monthKey
      )
    ) {
      return null;
    }

    const [year, month] =
      monthKey
        .split("-")
        .map(Number);

    return new Date(
      year,
      month - 1,
      1
    );
  };

  const [selectedDate, setSelectedDate] =
    useState(() => {
      return (
        getDateFromMonthKey(
          requestedMonth
        ) ?? new Date()
      );
    });

  useEffect(() => {
    const requestedDate =
      getDateFromMonthKey(
        requestedMonth
      );

    if (requestedDate) {
      setSelectedDate(
        requestedDate
      );
    }
  }, [requestedMonth]);

  const [totalSalary, setTotalSalary] = useState(0);

  const payments = useFinanceStore((state) => state.payments);

const monthKey =
  `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, "0")}`;

const paidAmount = payments
  .filter((payment) => payment.monthKey === monthKey)
  .reduce((sum, payment) => {
    return (
      sum +
      Number(payment.amount.replace(/[^\d]/g, ""))
    );
  }, 0);

  return (
    <main className={styles.page}>
      <PageHeader title="Деньги" />

      <div className={styles.content}>
        <div className={styles.scrollContent}>
          <PeriodPicker
  selectedDate={selectedDate}
  onChange={setSelectedDate}
/>

<CurrentSalary
  total={totalSalary}
  paid={paidAmount}
/>

<DailyStatistics
  selectedDate={selectedDate}
  onChange={setSelectedDate}
  title="Заработок по дням"
  mode="money"
/>

<Payments
  selectedDate={selectedDate}
  autoOpenType={
    requestedPaymentType
  }
  autoOpenDate={
    requestedPaymentDate
  }
/>

<Deductions
  selectedDate={selectedDate}
/>

<SalaryBreakdown
  selectedDate={selectedDate}
  onTotalChange={setTotalSalary}
/>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}
