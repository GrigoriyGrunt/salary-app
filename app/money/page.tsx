"use client";

import {
  useEffect,
  useMemo,
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
import { useUsersStore } from "@/store/usersStore";
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
export default function MoneyPage() {
  const searchParams =
    useSearchParams();

  const requestedMonth =
    searchParams.get("month");

  const requestedPaymentType =
    searchParams.get("paymentType");

  const requestedPaymentDate =
    searchParams.get("paymentDate");
  const requestedPeriodKey =
  searchParams.get("periodKey");  

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

  if (requestedPeriodKey) {
    const requestedIndex = watchPeriods.findIndex(
      (period) =>
        `${period.startDate}_${period.endDate}` === requestedPeriodKey
    );

    if (requestedIndex >= 0) {
      setSelectedWatchPeriodIndex(requestedIndex);
      setSelectedDate(
        new Date(`${watchPeriods[requestedIndex].startDate}T00:00:00`)
      );
      return;
    }
  }

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
}, [isWatchEmployee, watchPeriods, requestedPeriodKey]);

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
  const [showMoneyGuide, setShowMoneyGuide] = useState(false);

    useEffect(() => {
    if (!currentUser?.id || !currentUser.isSetupCompleted) return;

    const key = `money-guide-shown-${currentUser.id}`;

    if (localStorage.getItem(key) !== "true") {
      localStorage.setItem(key, "true");
      setShowMoneyGuide(true);
    }
  }, [currentUser?.id, currentUser?.isSetupCompleted]);

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

<CurrentSalary
  total={totalSalary}
  paid={paidAmount}
  isWatchEmployee={isWatchEmployee}
/>

<DailyStatistics
  selectedDate={selectedDate}
  onChange={setSelectedDate}
  title="Заработок по дням"
  mode="money"
  watchPeriod={selectedWatchPeriod}
/>

<Payments
  selectedDate={selectedDate}
  autoOpenType={requestedPaymentType}
  autoOpenDate={requestedPaymentDate}
  watchPeriod={selectedWatchPeriod}
/>

<Deductions
  selectedDate={selectedDate}
/>

<SalaryBreakdown
  selectedDate={selectedDate}
  onTotalChange={setTotalSalary}
  watchPeriod={selectedWatchPeriod}
/>
        </div>
      </div>
      {showMoneyGuide && (
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
              Это раздел «Деньги». Здесь отображается общая заработанная
              сумма. Тут Вы можете вносить фактические поступления аванса,
              зарплаты и других выплат, добавлять списания за ошибки,
              бой, штрафы и другие удержания, а также детально ознакомиться,
              из чего складывается зарплата.
            </p>

            <button
              onClick={() => setShowMoneyGuide(false)}
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
