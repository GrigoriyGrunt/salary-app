"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo/Logo";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import styles from "./page.module.css";
import { useUsersStore } from "@/store/usersStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useFinanceStore } from "@/store/financeStore";
import { useNotificationStore } from "@/store/notificationStore";

export default function LoginPage() {
   const router = useRouter();

   const [login, setLogin] = useState("");
const [code, setCode] = useState("");
const [isCodeVisible, setIsCodeVisible] = useState(false);
   const [rememberLogin, setRememberLogin] =
  useState(false);
   const setCurrentUserFromServer = useUsersStore(
  (state) => state.setCurrentUserFromServer
);
const setScheduleCurrentUser =
  useScheduleStore(
    (state) => state.setCurrentUser
  );
  const setScheduleData =
  useScheduleStore(
    (state) => state.setScheduleData
  );
  const setFinanceCurrentUser =
  useFinanceStore(
    (state) => state.setCurrentUser
  );
  const setFinanceData =
  useFinanceStore(
    (state) => state.setFinanceData
  );
  const setNotificationCurrentUser =
  useNotificationStore(
    (state) => state.setCurrentUser
  );
   async function handleLogin() {
  if (login.trim() === "") {
    alert("Введите логин");
    return;
  }

  if (code.trim() === "") {
    alert("Введите код сотрудника");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  login: login.trim(),
  accessCode: code,
  rememberLogin,
}),
    });

    if (!response.ok) {
      alert("Неверный логин или код");
      return;
    }

    const loginData = await response.json();

const {
  sessionExpiresAt,
  ...serverUser
} = loginData;

const user = {
  ...serverUser,
  accessCode: "",
};

    setCurrentUserFromServer(user);

    setScheduleCurrentUser(user.id);

try {
  const scheduleResponse = await fetch(
    `/api/schedule?userId=${user.id}`
  );

  if (!scheduleResponse.ok) {
    throw new Error(
      "Не удалось загрузить график"
    );
  }

  const scheduleData =
    await scheduleResponse.json();

  const shifts = scheduleData.shifts.map(
    (shift: {
      date: string;
      [key: string]: unknown;
    }) => ({
      ...shift,
      date: new Date(shift.date),
    })
  );

  setScheduleData(
    shifts,
    scheduleData.originalMainShiftsByMonth
  );
} catch (error) {
  console.error(
    "Ошибка загрузки графика:",
    error
  );
}

setFinanceCurrentUser(user.id);

try {
  const financeResponse = await fetch(
    `/api/finance?userId=${user.id}`
  );

  if (!financeResponse.ok) {
    throw new Error(
      "Не удалось загрузить финансовые данные"
    );
  }

  const financeData =
    await financeResponse.json();

  setFinanceData(financeData);
} catch (error) {
  console.error(
    "Ошибка загрузки финансовых данных:",
    error
  );
}

setNotificationCurrentUser(user.id);

    const isProfileConfigured =
      user.isSetupCompleted;

    localStorage.setItem(
      "currentUserId",
      user.id
    );

    localStorage.setItem(
      "rememberLogin",
      String(rememberLogin)
    );

    const needsTemporarySession =
      !isProfileConfigured || !rememberLogin;

    if (needsTemporarySession) {
  localStorage.setItem(
    "loginExpiresAt",
    String(
      new Date(sessionExpiresAt).getTime()
    )
  );
} else {
  localStorage.removeItem(
    "loginExpiresAt"
  );
}

    if (isProfileConfigured) {
      router.push("/");
    } else {
      router.push("/onboarding");
    }
  } catch (error) {
    console.error(
      "Ошибка входа:",
      error
    );

    alert(
      "Не удалось выполнить вход. Попробуйте ещё раз."
    );
  }
}
  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <Logo
          variant="full"
          className={styles.logo}
        />

        <p className={styles.subtitle}>
          Твой личный калькулятор зарплаты
        </p>

        <div className={styles.card}>
          <Input
  value={login}
  onChange={(e) => setLogin(e.target.value)}
  placeholder="Введите логин"
/>

<div className={styles.codeInputWrapper}>
  <Input
    value={code}
    onChange={(e) => setCode(e.target.value)}
    placeholder="Введите код сотрудника"
    type={isCodeVisible ? "text" : "password"}
  />

  <button
    type="button"
    className={styles.eyeButton}
    onClick={() => setIsCodeVisible(!isCodeVisible)}
  >
    {isCodeVisible ? "👁" : "👁"}
  </button>
</div>
<label className={styles.remember}>
  <input
    className={styles.rememberInput}
    type="checkbox"
    checked={rememberLogin}
    onChange={(e) =>
      setRememberLogin(e.target.checked)
    }
  />

  <span className={styles.rememberCheck}>
    ✓
  </span>

  <span className={styles.rememberText}>
    Сохранить вход
  </span>
</label>
          <Button onClick={handleLogin}>
            Войти
          </Button>
        </div>

      </div>
    </main>
  );
}
