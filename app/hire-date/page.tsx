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

  async function handleContinue() {
  if (!date) return;
  if (!currentUser) return;

  try {
    const response = await fetch("/api/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: currentUser.id,
        hireDate: date.toISOString(),
      }),
    });

    if (!response.ok) {
      alert("Не удалось сохранить дату устройства");
      return;
    }

    updateUser(currentUser.id, {
      hireDate: date.toISOString(),
    });

    router.push("/next-shift");
  } catch (error) {
    console.error(
      "Ошибка сохранения даты устройства:",
      error
    );

    alert("Не удалось сохранить дату устройства");
  }
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