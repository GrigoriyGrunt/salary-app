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
const [watchType, setWatchType] = useState<"main" | "extra" | "">("");

  async function handleContinue() {
  if (!warehouse || !position || !schedule) return;

if (schedule === "15/15 вахта" && !watchType) return;

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

if (schedule === "15/15 вахта") {
  sessionStorage.setItem("watchType", watchType);
}

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
  {
  label: "РЦ Кстово",
  disabled: true,
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
              },
              {
                label: "Кладовщик",
              },
              {
  label: "Штабелер (водитель погрузчика)",
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
  disabled:
    position === "Комплектовщик табака" ||
    position === "Штабелер (водитель погрузчика)" ||
    position === "Кладовщик",
},
              {
  label: "5/2",
  disabled: true,
},
            ]}
                    />

{schedule === "15/15 вахта" && (
  <>
    <Select
      label="Тип вахты"
      placeholder="Выберите тип вахты"
      value={
        watchType === "main"
          ? "Плановая вахта"
          : watchType === "extra"
            ? "Межвахта"
            : ""
      }
      onChange={(value) => {
        setWatchType(
          value === "Плановая вахта" ? "main" : "extra"
        );
      }}
      options={[
  {
    label: "Плановая вахта",
    description:
      'Плановая вахта - это основные смены по графику с возможностью взять два выходных (в календаре выходные не указаны, изменить тип можно потом самостоятельно в разделе "График"). В графике смены будут отображаться ОСН (основная смена).',
  },
  {
    label: "Межвахта",
    description:
      "Межвахта - это период между плановыми вахтами, в которой каждая смена считается подработкой (двойной оклад), выходные в межвахте не предусмотрены. В графике смены будут отображаться ДОП (подработка).",
  },
]}
    />
  </>
)}

          <Button onClick={handleContinue}>
            Продолжить
          </Button>
        </div>
      </div>
    </main>
  );
}