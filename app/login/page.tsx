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
   const users = useUsersStore((state) => state.users);
   const setCurrentUser = useUsersStore(
  (state) => state.setCurrentUser
);
const setScheduleCurrentUser =
  useScheduleStore(
    (state) => state.setCurrentUser
  );
  const setFinanceCurrentUser =
  useFinanceStore(
    (state) => state.setCurrentUser
  );
  const setNotificationCurrentUser =
  useNotificationStore(
    (state) => state.setCurrentUser
  );
   function handleLogin() {
  if (login.trim() === "") {
  alert("Введите логин");
  return;
}

if (code.trim() === "") {
  alert("Введите код сотрудника");
  return;
}

const user = users.find(
  (user) =>
    user.login === login.trim() &&
    user.accessCode === code
);

if (!user) {
  alert("Неверный логин или код");
  return;
}
  setCurrentUser(user.id);
setScheduleCurrentUser(user.id);
setFinanceCurrentUser(user.id);
setNotificationCurrentUser(user.id);

const isProfileConfigured = user.isSetupCompleted;

  localStorage.setItem("currentUserId", user.id);
  localStorage.setItem("rememberLogin", String(rememberLogin));

  const needsTemporarySession =
    !isProfileConfigured || !rememberLogin;

  if (needsTemporarySession) {
    const expiresAt = Date.now() + 5 * 60 * 1000;
    localStorage.setItem("loginExpiresAt", String(expiresAt));
  } else {
    localStorage.removeItem("loginExpiresAt");
  }

  if (isProfileConfigured) {
    router.push("/");
  } else {
    router.push("/onboarding");
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
