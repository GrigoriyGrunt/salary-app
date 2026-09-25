"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button/Button";
import Select from "@/components/Select/Select";
import BackButton from "@/components/BackButton/BackButton";

import type { WorkSchedule } from "@/lib/profile";
import { useUsersStore } from "@/store/usersStore";

import styles from "./page.module.css";

export default function OnboardingPage() {
  const router = useRouter();
  const currentUser = useUsersStore(
  (state) => state.currentUser
);

const updateUser = useUsersStore(
  (state) => state.updateUser
);

  const [warehouse, setWarehouse] = useState(
  currentUser?.warehouse ?? ""
);

const [position, setPosition] = useState(
  currentUser?.position ?? ""
);

const [schedule, setSchedule] = useState<WorkSchedule | "">(
  (currentUser?.schedule as WorkSchedule) ?? ""
);

  async function handleContinue() {
  if (!warehouse || !position || !schedule) return;

  if (!currentUser) return;

  try {
    const response = await fetch("/api/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: currentUser.id,
        warehouse,
        position,
        schedule,
      }),
    });

    if (!response.ok) {
      alert("Не удалось сохранить настройки");
      return;
    }

    updateUser(currentUser.id, {
      warehouse,
      position,
      schedule,
    });

    router.push("/hire-date");
  } catch (error) {
    console.error(
      "Ошибка сохранения onboarding:",
      error
    );

    alert("Не удалось сохранить настройки");
  }
}

  return (
  <main className={styles.page}>

    <BackButton />

    <div className={styles.container}>

      <h1 className={styles.title}>
        Добро пожаловать!
      </h1>

        <p className={styles.subtitle}>
          Давайте настроим приложение.
          <br />
          Это займёт меньше минуты.
        </p>

        <div className={styles.form}>
          <Select
            label="Склад"
            placeholder="Выберите склад"
            value={warehouse}
            onChange={(value) => {
  setWarehouse(value);
}}
            options={[
              {
                label: "РЦ Хабаровск",
              },
            ]}
          />

          <Select
            label="Должность"
            placeholder="Выберите должность"
            value={position}
            onChange={(value) => {
  setPosition(value);
}}
            options={[
              {
                label: "Комплектовщик основы",
              },
              {
                label: "Комплектовщик табака",
                disabled: true,
              },
              {
                label: "Кладовщик",
                disabled: true,
              },
              {
  label: "Штабелер (водитель погрузчика)",
  disabled: true,
},
            ]}
          />

          <Select
            label="График"
            placeholder="Выберите график"
            value={schedule}
            onChange={(value) => {
  setSchedule(value as WorkSchedule);
}}
            options={[
              {
                label: "2/2 день/ночь",
              },
              {
                label: "2/2 день",
              },
              {
                label: "2/2 ночь",
              },
              {
                label: "15/15 вахта",
              },
              {
  label: "5/2",
  disabled: true,
},
            ]}
          />

          <Button onClick={handleContinue}>
            Продолжить
          </Button>
        </div>
      </div>
    </main>
  );
}