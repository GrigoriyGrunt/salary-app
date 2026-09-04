"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button/Button";
import DatePicker from "@/components/DatePicker/DatePicker";
import BackButton from "@/components/BackButton/BackButton";
import { useUsersStore } from "@/store/usersStore";

import styles from "./page.module.css";

export default function HireDatePage() {
  const router = useRouter();
  const currentUser = useUsersStore(
  (state) => state.currentUser
);

const updateUser = useUsersStore(
  (state) => state.updateUser
);

 const [date, setDate] = useState<Date | undefined>(
  currentUser?.hireDate
    ? new Date(currentUser.hireDate)
    : undefined
);

  function handleContinue() {
    if (!date) return;
    if (currentUser) {
  updateUser(currentUser.id, {
    hireDate: date.toISOString(),
  });
}

    router.push("/next-shift");
  }

  return (
    <main className={styles.page}>
      <BackButton />
      <div className={styles.container}>
        <h1 className={styles.title}>
          Дата устройства
        </h1>

        <p className={styles.subtitle}>
          Эта дата используется для расчёта стажа,
          премии и других показателей.
        </p>

        <div className={styles.card}>
          <DatePicker
  label="Дата устройства на работу"
  value={date}
  onChange={setDate}
  mode="hire"
/>
        </div>

        <Button onClick={handleContinue}>
          Продолжить
        </Button>
      </div>
    </main>
  );
}