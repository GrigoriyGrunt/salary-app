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
  const [isCreateProfileOpen, setIsCreateProfileOpen] =
  useState(false);

const [newProfileLastName, setNewProfileLastName] =
  useState("");

const [newProfileFirstName, setNewProfileFirstName] =
  useState("");

const [newProfileMiddleName, setNewProfileMiddleName] =
  useState("");
const [newProfileLogin, setNewProfileLogin] =
  useState("");
const [newProfileCode, setNewProfileCode] =
  useState("");
  function generateProfileLogin(
  lastName: string,
  firstName: string,
  middleName: string
) {
  if (
    !lastName.trim() ||
    !firstName.trim() ||
    !middleName.trim()
  ) {
    return "";
  }

  const transliteration: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d",
    е: "e", ё: "e", ж: "zh", з: "z", и: "i",
    й: "y", к: "k", л: "l", м: "m", н: "n",
    о: "o", п: "p", р: "r", с: "s", т: "t",
    у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch",
    ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "",
    э: "e", ю: "yu", я: "ya",
  };

  function transliterate(value: string) {
    return value
      .toLowerCase()
      .split("")
      .map((char) => transliteration[char] ?? char)
      .join("");
  }

  const lastNameLatin = transliterate(lastName.trim());

  return (
    lastNameLatin.charAt(0).toUpperCase() +
    lastNameLatin.slice(1) +
    transliterate(firstName.trim()).charAt(0).toUpperCase() +
    transliterate(middleName.trim()).charAt(0).toUpperCase()
  );
}
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
        <button
          type="button"
          className={styles.createProfileButton}
          onClick={() => setIsCreateProfileOpen(true)}
        >
          Создать профиль
        </button>
      {isCreateProfileOpen && (
        <div className={styles.createProfileOverlay}>
          <div className={styles.createProfileModal}>
            <h2>Создание профиля</h2>

<input
  className={styles.createProfileInput}
  type="text"
  placeholder="Фамилия"
  value={newProfileLastName}
  onChange={(event) => {
  const value = event.target.value;
  setNewProfileLastName(value);

  setNewProfileLogin(
    generateProfileLogin(
      value,
      newProfileFirstName,
      newProfileMiddleName
    )
  );
}}
/>

<input
  className={styles.createProfileInput}
  type="text"
  placeholder="Имя"
  value={newProfileFirstName}
  onChange={(event) => {
  const value = event.target.value;
  setNewProfileFirstName(value);

  setNewProfileLogin(
    generateProfileLogin(
      newProfileLastName,
      value,
      newProfileMiddleName
    )
  );
}}
/>

<input
  className={styles.createProfileInput}
  type="text"
  placeholder="Отчество"
  value={newProfileMiddleName}
  onChange={(event) => {
  const value = event.target.value;
  setNewProfileMiddleName(value);

  setNewProfileLogin(
    generateProfileLogin(
      newProfileLastName,
      newProfileFirstName,
      value
    )
  );
}}
/>

<input
  className={styles.createProfileInput}
  type="text"
  placeholder="Логин будет создан автоматически"
  value={newProfileLogin}
onChange={(event) =>
  setNewProfileLogin(
    event.target.value.replace(/[^a-zA-Z0-9]/g, "")
  )
}
/>

<input
  className={styles.createProfileInput}
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  maxLength={20}
  placeholder="Код, например 123456"
  value={newProfileCode}
  onChange={(event) => {
    const value = event.target.value.replace(/\D/g, "");
    setNewProfileCode(value);
  }}
/>

<div className={styles.createProfileActions}>
  <button
    className={styles.createProfileCancel}
    onClick={() => {
      setIsCreateProfileOpen(false);
      setNewProfileLastName("");
      setNewProfileFirstName("");
      setNewProfileMiddleName("");
      setNewProfileCode("");
    }}
  >
    Отмена
  </button>

  <button
    className={styles.createProfileConfirm}
    onClick={async () => {
  if (
    !newProfileLastName.trim() ||
    !newProfileFirstName.trim() ||
    !newProfileMiddleName.trim()
  ) {
    alert("Заполните фамилию, имя и отчество");
    return;
  }

  if (!newProfileLogin.trim()) {
    alert("Введите логин");
    return;
  }

  if (!/^[a-zA-Z0-9]+$/.test(newProfileLogin.trim())) {
    alert(
      "Логин должен содержать только английские буквы и цифры"
    );
    return;
  }

  if (newProfileCode.length < 4) {
    alert("Код должен содержать минимум 4 цифры");
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lastName: newProfileLastName.trim(),
        firstName: newProfileFirstName.trim(),
        middleName: newProfileMiddleName.trim(),
        login: newProfileLogin.trim(),
        accessCode: newProfileCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Не удалось создать профиль");
      return;
    }

    alert("Профиль успешно создан");

    setIsCreateProfileOpen(false);

    setNewProfileLastName("");
    setNewProfileFirstName("");
    setNewProfileMiddleName("");
    setNewProfileLogin("");
    setNewProfileCode("");
  } catch (error) {
    console.error(
      "Ошибка создания профиля:",
      error
    );

    alert(
      "Не удалось создать профиль. Попробуйте ещё раз."
    );
  }
}}
  >
    Создать профиль
  </button>
</div>
          </div>
        </div>
      )}        
      </div>
    </main>
  );
}
