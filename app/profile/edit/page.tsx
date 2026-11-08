"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useShiftEditor } from "@/components/common/ShiftEditorProvider/ShiftEditorProvider";
import PageHeader from "@/components/PageHeader/PageHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import Button from "@/components/Button/Button";

import { useUsersStore } from "@/store/usersStore";

import styles from "./page.module.css";
import DatePicker from "@/components/DatePicker/DatePicker";
export default function EditProfilePage() {
  const router = useRouter();
const { openChangeSchedule } = useShiftEditor();
  const currentUser = useUsersStore(
    (state) => state.currentUser
  );
const updateUser = useUsersStore(
  (state) => state.updateUser
);
  const [isSaving, setIsSaving] = useState(false);
const [isNameOpen, setIsNameOpen] = useState(false);
const [isLoginOpen, setIsLoginOpen] = useState(false);
const [isCodeOpen, setIsCodeOpen] = useState(false);
const [isForgotCodeOpen, setIsForgotCodeOpen] = useState(false);
const [oldCode, setOldCode] = useState("");
const [newCode, setNewCode] = useState("");
const [isOldCodeVisible, setIsOldCodeVisible] = useState(false);
const [isNewCodeVisible, setIsNewCodeVisible] = useState(false);
const [login, setLogin] = useState("");
const [lastName, setLastName] = useState("");
const [firstName, setFirstName] = useState("");
const [middleName, setMiddleName] = useState("");
const [isHireDateOpen, setIsHireDateOpen] = useState(false);
const [hireDate, setHireDate] = useState<Date | undefined>(undefined);
const originalHireDate = currentUser?.hireDate
  ? new Date(currentUser.hireDate)
  : undefined;

const hasChanges =
  lastName.trim() !== (currentUser?.lastName || "") ||
  firstName.trim() !== (currentUser?.firstName || "") ||
  middleName.trim() !== (currentUser?.middleName || "") ||
  login.trim() !== (currentUser?.login || "") ||
  hireDate?.toDateString() !== originalHireDate?.toDateString() ||
  oldCode.trim() !== "" ||
  newCode.trim() !== "";
useEffect(() => {
  if (!currentUser) return;

  setLastName(currentUser.lastName || "");
  setFirstName(currentUser.firstName || "");
  setMiddleName(currentUser.middleName || "");
  setLogin(currentUser.login || "");
  setHireDate(
  currentUser.hireDate
    ? new Date(currentUser.hireDate)
    : undefined
);
}, [currentUser]);
  const handleBack = () => {
  router.push("/profile");
};

const handleSave = async () => {
  if (!currentUser || isSaving) return;
if (oldCode.trim() && !newCode.trim()) {
  alert("Введите новый код");
  return;
}

if (newCode.trim() && !oldCode.trim()) {
  alert("Введите старый код");
  return;
}
  setIsSaving(true);

  try {
    const response = await fetch("/api/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: currentUser.id,
lastName: lastName.trim(),
firstName: firstName.trim(),
middleName: middleName.trim(),
login: login.trim(),
oldAccessCode: newCode.trim() ? oldCode.trim() : undefined,
accessCode: newCode.trim() || undefined,
hireDate: hireDate?.toISOString(),
      }),
    });

const result = await response.json();

if (!response.ok) {
  alert(result.error || "Не удалось сохранить изменения");
  return;
}

updateUser(currentUser.id, {
  lastName: lastName.trim(),
  firstName: firstName.trim(),
  middleName: middleName.trim(),
  login: login.trim(),
  hireDate: hireDate?.toISOString() || currentUser.hireDate,
});
setOldCode("");
setNewCode("");
router.push("/profile");
  } catch (error) {
    console.error("Ошибка сохранения профиля:", error);
    alert("Не удалось сохранить изменения");
  } finally {
    setIsSaving(false);
  }
};

  return (
    <main className={styles.page}>
      <PageHeader title="Редактирование профиля" />

      <div className={styles.content}>
        <div className={styles.card}>
          <button
            type="button"
            className={styles.item}
            onClick={() => setIsNameOpen(true)}
          >
            <span>ФИО</span>
            <span className={styles.arrow}>›</span>
          </button>

<button
  type="button"
  className={styles.item}
  onClick={() => setIsLoginOpen(true)}
>
  <span>Логин</span>
  <span className={styles.arrow}>›</span>
</button>

          <button
            type="button"
            className={styles.item}
            onClick={() => setIsCodeOpen(true)}
          >
            <span>Код входа</span>
            <span className={styles.arrow}>›</span>
          </button>

          <button
            type="button"
            className={styles.item}
            onClick={() => {}}
          >
            <span>Должность</span>
            <span className={styles.arrow}>›</span>
          </button>

          <button
            type="button"
            className={styles.item}
            onClick={openChangeSchedule}
          >
            <span>График работы</span>
            <span className={styles.arrow}>›</span>
          </button>

<button
  type="button"
  className={styles.item}
  onClick={() => setIsHireDateOpen(true)}
>
  <span>Дата трудоустройства</span>
  <span className={styles.arrow}>›</span>
</button>
        </div>

        <div className={styles.actions}>
          <Button onClick={handleBack}>
            Назад
          </Button>

<Button
  onClick={handleSave}
  disabled={!hasChanges || isSaving}
>
  {isSaving ? "Сохранение..." : "Сохранить"}
</Button>
        </div>
      </div>
{isNameOpen && (
  <div className={styles.overlay}>
    <div className={styles.resetModal}>
      <h2>Изменение ФИО</h2>

      <input
        className={styles.codeInput}
        placeholder="Фамилия"
        value={lastName}
        onChange={(e) =>
  setLastName(e.target.value.replace(/[^А-Яа-яЁё -]/g, ""))
}
      />

      <input
        className={styles.codeInput}
        placeholder="Имя"
        value={firstName}
        onChange={(e) =>
  setFirstName(e.target.value.replace(/[^А-Яа-яЁё -]/g, ""))
}
      />

      <input
        className={styles.codeInput}
        placeholder="Отчество"
        value={middleName}
        onChange={(e) =>
  setMiddleName(e.target.value.replace(/[^А-Яа-яЁё -]/g, ""))
}
      />

      <div className={styles.modalActions}>
        <button
          className={styles.cancelButton}
          onClick={() => {
  setLastName(currentUser?.lastName || "");
  setFirstName(currentUser?.firstName || "");
  setMiddleName(currentUser?.middleName || "");
  setIsNameOpen(false);
}}
        >
          Отмена
        </button>

        <button
          className={styles.confirmButton}
          onClick={() => setIsNameOpen(false)}
        >
          Готово
        </button>
      </div>
    </div>
  </div>
)}
{isLoginOpen && (
  <div className={styles.overlay}>
    <div className={styles.resetModal}>
      <h2>Изменение логина</h2>

      <input
        className={styles.codeInput}
        type="text"
        placeholder="Логин"
        value={login}
        onChange={(e) =>
  setLogin(e.target.value.replace(/[^A-Za-z0-9.!]/g, ""))
}
      />

      <div className={styles.modalActions}>
        <button
          className={styles.cancelButton}
          onClick={() => {
            setLogin(currentUser?.login || "");
            setIsLoginOpen(false);
          }}
        >
          Отмена
        </button>

        <button
          className={styles.confirmButton}
          onClick={() => setIsLoginOpen(false)}
        >
          Готово
        </button>
      </div>
    </div>
  </div>
)}
{isCodeOpen && (
  <div className={styles.overlay}>
    <div className={styles.resetModal}>
      <h2>Сменить код входа</h2>

      <div className={styles.codeInputWrapper}>
        <input
          className={styles.codeInput}
          type={isOldCodeVisible ? "text" : "password"}
          value={oldCode}
          onChange={(e) =>
  setOldCode(e.target.value.replace(/\D/g, ""))
}
          placeholder="Введите старый код"
        />

        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setIsOldCodeVisible(!isOldCodeVisible)}
        >
          👁
        </button>
      </div>

      <div className={styles.codeInputWrapper}>
        <input
          className={styles.codeInput}
          type={isNewCodeVisible ? "text" : "password"}
          value={newCode}
          onChange={(e) =>
  setNewCode(e.target.value.replace(/\D/g, ""))
}
          placeholder="Введите новый код"
        />

        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setIsNewCodeVisible(!isNewCodeVisible)}
        >
          👁
        </button>
      </div>

      <button
        className={styles.forgotCode}
        onClick={() => setIsForgotCodeOpen(true)}
      >
        Забыли код?
      </button>

      <div className={styles.modalActions}>
        <button
          className={styles.cancelButton}
          onClick={() => {
            setOldCode("");
            setNewCode("");
            setIsCodeOpen(false);
          }}
        >
          Отмена
        </button>

        <button
          className={styles.confirmButton}
          onClick={() => setIsCodeOpen(false)}
        >
          Готово
        </button>
      </div>
    </div>
  </div>
)}

{isForgotCodeOpen && (
  <div className={styles.overlay}>
    <div className={styles.resetModal}>
      <h2>Забыли код?</h2>

      <p>
        Напишите администратору
        <br />
        89990894573 Григорий
      </p>

      <div className={styles.modalActions}>
        <button
          className={styles.confirmButton}
          onClick={() => setIsForgotCodeOpen(false)}
        >
          Понятно
        </button>
      </div>
    </div>
  </div>
)}
{isHireDateOpen && (
  <div className={styles.overlay}>
    <div className={styles.resetModal}>
      <h2>Дата трудоустройства</h2>

      <DatePicker
        label="Дата устройства на работу"
        value={hireDate}
        onChange={setHireDate}
        mode="hire"
      />

      <div className={styles.modalActions}>
        <button
          className={styles.cancelButton}
          onClick={() => {
            setHireDate(
              currentUser?.hireDate
                ? new Date(currentUser.hireDate)
                : undefined
            );
            setIsHireDateOpen(false);
          }}
        >
          Отмена
        </button>

        <button
          className={styles.confirmButton}
          onClick={() => setIsHireDateOpen(false)}
        >
          Готово
        </button>
      </div>
    </div>
  </div>
)}
      <BottomNavigation />
    </main>
  );
}