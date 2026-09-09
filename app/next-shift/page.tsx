"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button/Button";
import BackButton from "@/components/BackButton/BackButton";
import NextShiftSelector from "@/components/common/NextShiftSelector/NextShiftSelector";
import { generateSchedule } from "@/lib/generateSchedule";
import { validateShifts } from "@/lib/validateShifts";

import { useScheduleStore } from "@/store/scheduleStore";
import { useUsersStore } from "@/store/usersStore";

import styles from "./page.module.css";
function formatCalendarDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseCalendarDate(value: string) {
  const [year, month, day] =
    value.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}
export default function NextShiftPage() {
  const router = useRouter();

  const setShifts = useScheduleStore(
  (state) => state.setShifts
);

const setOriginalMainShifts = useScheduleStore(
  (state) => state.setOriginalMainShifts
);
const currentUser = useUsersStore(
  (state) => state.currentUser
);

const updateUser = useUsersStore(
  (state) => state.updateUser
);
const [firstDate, setFirstDate] =
  useState<Date | undefined>(
    currentUser?.firstShiftDate
  ? parseCalendarDate(
      currentUser.firstShiftDate
    )
  : undefined
  );

const [secondDate, setSecondDate] =
  useState<Date | undefined>(
    currentUser?.secondShiftDate
  ? parseCalendarDate(
      currentUser.secondShiftDate
    )
  : undefined
  );

const [firstShift, setFirstShift] =
  useState<"day" | "night" | null>(
    currentUser?.firstShiftType ?? null
  );

const [secondShift, setSecondShift] =
  useState<"day" | "night" | null>(
    currentUser?.secondShiftType ?? null
  );

const isDayNight =
  currentUser?.schedule === "2/2 день/ночь";

const isWatch1515 =
  currentUser?.schedule === "15/15 вахта";

async function handleContinue() {
  if (!firstDate || !secondDate) return;

  if (!currentUser) return;

  let resolvedFirstShift: "day" | "night";
  let resolvedSecondShift: "day" | "night";

  if (currentUser.schedule === "2/2 день") {
    resolvedFirstShift = "day";
    resolvedSecondShift = "day";
  } else if (currentUser.schedule === "2/2 ночь") {
    resolvedFirstShift = "night";
    resolvedSecondShift = "night";
  } else if (
    currentUser.schedule === "15/15 вахта"
  ) {
    resolvedFirstShift = "day";
    resolvedSecondShift = "day";
  } else {
    if (!firstShift || !secondShift) return;

    resolvedFirstShift = firstShift;
    resolvedSecondShift = secondShift;
  }

  const daysBetween = Math.round(
    (
      secondDate.getTime() -
      firstDate.getTime()
    ) /
      (1000 * 60 * 60 * 24)
  );

  if (
    isDayNight &&
    !validateShifts(
      resolvedFirstShift,
      resolvedSecondShift,
      daysBetween
    )
  ) {
    alert(
      "Проверьте выбранные ближайшие смены."
    );
    return;
  }

  const userForSchedule = {
  ...currentUser,
  firstShiftDate:
    formatCalendarDate(firstDate),
  secondShiftDate:
    formatCalendarDate(secondDate),
  firstShiftType: resolvedFirstShift,
  secondShiftType: resolvedSecondShift,
};

  const shifts = generateSchedule(userForSchedule);

const mainShiftsByMonth = shifts.reduce<
  Record<string, number>
>((result, shift) => {
  if (shift.workType !== "main") {
    return result;
  }

  const date = new Date(shift.date);

  const monthKey = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;

  result[monthKey] =
    (result[monthKey] ?? 0) + 1;

  return result;
}, {});

Object.entries(mainShiftsByMonth).forEach(
  ([monthKey, count]) => {
    setOriginalMainShifts(monthKey, count);
  }
);

setShifts(shifts);
const shiftsForServer = shifts.map(
  (shift) => ({
    ...shift,
    date: formatCalendarDate(shift.date),
  })
);
try {
  const scheduleResponse = await fetch(
    "/api/schedule",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        shifts: shiftsForServer,
        originalMainShiftsByMonth:
          mainShiftsByMonth,
      }),
    }
  );

  if (!scheduleResponse.ok) {
    alert("Не удалось сохранить график");
    return;
  }

  const rememberLogin =
  localStorage.getItem("rememberLogin") === "true";

const response = await fetch(
  "/api/auth/complete-setup",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  firstShiftDate:
    formatCalendarDate(firstDate),

  secondShiftDate:
    formatCalendarDate(secondDate),

  firstShiftType:
    resolvedFirstShift,

  secondShiftType:
    resolvedSecondShift,

  rememberLogin,
}),
  }
);

if (!response.ok) {
  alert("Не удалось сохранить настройки смен");
  return;
}

const completeSetupData = await response.json();

if (
  rememberLogin &&
  completeSetupData.sessionExpiresAt
) {
  localStorage.removeItem("loginExpiresAt");
}

updateUser(currentUser.id, {
      firstShiftDate:
        formatCalendarDate(firstDate),

      secondShiftDate:
        formatCalendarDate(secondDate),

      firstShiftType: resolvedFirstShift,
      secondShiftType: resolvedSecondShift,
      isSetupCompleted: true,
    });

    router.push("/");
  } catch (error) {
    console.error(
      "Ошибка сохранения настроек смен:",
      error
    );

    alert("Не удалось сохранить настройки смен");
  }
}

  return (
    <main className={styles.page}>
      <BackButton />

      <div className={styles.container}>

        <h1 className={styles.title}>
          Ближайшие смены
        </h1>

        <p className={styles.subtitle}>
  {isWatch1515
    ? "Укажите начало и конец текущей вахты. На их основе приложение автоматически построит рабочий график."
    : "Укажите две ближайшие рабочие смены. На их основе приложение автоматически построит рабочий график."}
</p>

<NextShiftSelector
  isDayNight={isDayNight}
  isWatch1515={isWatch1515}
  firstDate={firstDate}
  secondDate={secondDate}
  onFirstDateChange={setFirstDate}
  onSecondDateChange={setSecondDate}
  firstShift={firstShift}
  secondShift={secondShift}
  onFirstShiftChange={setFirstShift}
  onSecondShiftChange={setSecondShift}
  styles={styles}
/>

        <Button onClick={handleContinue}>
          Продолжить
        </Button>

      </div>
    </main>
  );
}
