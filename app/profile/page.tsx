"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader/PageHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

import styles from "./page.module.css";
import { useUsersStore } from "@/store/usersStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useFinanceStore } from "@/store/financeStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useRouter } from "next/navigation";
import { getExperienceYears } from "@/lib/experience";
function formatDate(date?: string) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("ru-RU");
}
function getExperienceLabel(years: number) {
  const lastTwo = years % 100;
  const lastOne = years % 10;

  if (
    lastTwo >= 11 &&
    lastTwo <= 14
  ) {
    return "лет";
  }

  if (lastOne === 1) {
    return "год";
  }

  if (
    lastOne >= 2 &&
    lastOne <= 4
  ) {
    return "года";
  }

  return "лет";
}
export default function ProfilePage() {
  const [isResetOpen, setIsResetOpen] =
  useState(false);
const [isChangeCodeOpen, setIsChangeCodeOpen] =
  useState(false);
const [oldCode, setOldCode] = useState("");
const [newCode, setNewCode] = useState("");
const [isForgotCodeOpen, setIsForgotCodeOpen] =
  useState(false);
  const [isSupportOpen, setIsSupportOpen] =
  useState(false);
  const [isAboutOpen, setIsAboutOpen] =
  useState(false);
  const [isLogoutOpen, setIsLogoutOpen] =
  useState(false);
  const [isOldCodeVisible, setIsOldCodeVisible] =
  useState(false);
const [isNewCodeVisible, setIsNewCodeVisible] =
  useState(false);
  const [isUsersManagementOpen, setIsUsersManagementOpen] =
  useState(false);
  const [isAddUserOpen, setIsAddUserOpen] =
  useState(false);
  const [isEditUserOpen, setIsEditUserOpen] =
  useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] =
  useState(false);

const [deletingUserId, setDeletingUserId] =
  useState<string | null>(null);

const [editingUserId, setEditingUserId] =
  useState<string | null>(null);

const [editUserLogin, setEditUserLogin] =
  useState("");

const [editUserCode, setEditUserCode] =
  useState("");
  const [newUserFullName, setNewUserFullName] =
  useState("");

const [newUserLogin, setNewUserLogin] =
  useState("");

const [newUserCode, setNewUserCode] =
  useState("");
  const [users, setUsers] = useState<any[]>([]);

async function loadUsers() {
  try {
    const response = await fetch("/api/users");

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();

    setUsers(data);
  } catch {
    alert("Не удалось загрузить пользователей");
  }
}

  const user = useUsersStore((state) => state.currentUser);
  useEffect(() => {
  if (user?.role === "admin") {
    loadUsers();
  }
}, [user?.role]);
  const updateUser = useUsersStore(
  (state) => state.updateUser
);

  const resetUser = useUsersStore(
  (state) => state.resetUser
);
const clearSchedule = useScheduleStore(
  (state) => state.clear
);
const clearFinance = useFinanceStore(
  (state) => state.clear
);

const clearNotifications = useNotificationStore(
  (state) => state.clear
);

const router = useRouter();
const logout = useUsersStore((state) => state.logout);

async function handleLogout() {
  try {
    const response = await fetch(
      "/api/auth/logout",
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      alert("Не удалось выйти из аккаунта");
      return;
    }

    logout();

    localStorage.removeItem("currentUserId");
    localStorage.removeItem("rememberLogin");
    localStorage.removeItem("loginExpiresAt");

    router.push("/splash");
  } catch {
    alert("Не удалось выйти из аккаунта");
  }
}
  const experience = getExperienceYears(
  user?.hireDate || ""
);
const today = new Date();

today.setHours(0, 0, 0, 0);

const currentSchedule = (() => {
  if (!user) return "-";

  const activeChanges =
    user.scheduleChanges
      .filter((change) => {
        const changeDate =
          new Date(change.changeDate);

        changeDate.setHours(0, 0, 0, 0);

        return changeDate <= today;
      })
      .sort(
        (a, b) =>
          new Date(b.changeDate).getTime() -
          new Date(a.changeDate).getTime()
      );

  return activeChanges[0]?.schedule ||
    user.schedule ||
    "-";
})();
async function handleChangeCode() {
  if (!user) return;

  if (oldCode.trim() === "") {
    alert("Введите старый код");
    return;
  }

  if (newCode.trim() === "") {
    alert("Введите новый код");
    return;
  }

  try {
    const response = await fetch(
      "/api/users",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          oldAccessCode: oldCode.trim(),
          accessCode: newCode.trim(),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.error ||
          "Не удалось изменить код"
      );
      return;
    }

    setOldCode("");
    setNewCode("");
    setIsChangeCodeOpen(false);

    alert("Код входа успешно изменён");
  } catch {
    alert("Не удалось изменить код");
  }
}
async function handleResetProfile() {
  if (!user) return;

  try {
    const response = await fetch(
      "/api/users/reset",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id: user.id,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.error ||
          "Не удалось сбросить данные профиля"
      );
      return;
    }

    resetUser(user.id);

    clearSchedule();
    clearFinance();
    clearNotifications();

    localStorage.removeItem("currentUserId");
    localStorage.removeItem("rememberLogin");
    localStorage.removeItem("loginExpiresAt");

    setIsResetOpen(false);

    router.push("/splash");
  } catch {
    alert("Не удалось сбросить данные профиля");
  }
}
  return (
    <main className={styles.page}>
      <PageHeader title="Профиль" />

      <div className={styles.content}>
        <div className={styles.scrollContent}>
          <div className={styles.profileCard}>
  <div>
              <h2 className={styles.name}>
  {user
    ? `${user.lastName} ${user.firstName} ${user.middleName}`
    : ""}
</h2>
              <p className={styles.position}>{user?.position}</p>

<p className={styles.warehouse}>
  Склад {user?.warehouse}
</p>
<p className={styles.hireDate}>
  Дата устройства: {formatDate(user?.hireDate)}
</p>

<p className={styles.experience}>
  Стаж: {experience}{" "}
  {getExperienceLabel(experience)}
</p>
<p className={styles.experience}>
  Текущий график: {currentSchedule}
</p>
            </div>
          </div>
{user?.role === "admin" && (
            <>
              <h3 className={styles.title}>Администрирование</h3>

              <div className={styles.card}>
                <button
  className={styles.item}
  onClick={() => setIsUsersManagementOpen(true)}
>
  Управление пользователями
</button>
              </div>
            </>
          )}
          <h3 className={styles.title}>Настройки</h3>
          
          <div className={styles.card}>
            <button
  className={styles.item}
  onClick={() => setIsChangeCodeOpen(true)}
>
  Сменить код входа
</button>
            <button
  className={styles.item}
  onClick={() => setIsSupportOpen(true)}
>
  Помощь и поддержка
</button>
            <button
  className={styles.item}
  onClick={() => setIsAboutOpen(true)}
>
  О приложении
</button>
          </div>
          <div className={styles.card}>
  <button
    className={styles.logout}
    onClick={() => setIsLogoutOpen(true)}
  >
    Выйти из аккаунта
  </button>
</div>
<div className={styles.resetProfileSpacer} />

<div className={styles.card}>
  <button
    className={styles.logout}
    onClick={() => setIsResetOpen(true)}
  >
    Сбросить параметры профиля
  </button>
</div>
        </div>
            </div>

      <BottomNavigation />
      {isUsersManagementOpen && (
  <div className={styles.overlay}>
    <div className={styles.usersModal}>
      <div className={styles.usersHeader}>
        <h2>Текущие пользователи</h2>

        <button
          className={styles.addUserButton}
          onClick={() => setIsAddUserOpen(true)}
        >
          Добавить нового пользователя
        </button>
      </div>

      <div className={styles.usersList}>
        {users
          .slice()
          .sort((a, b) => {
            if (a.role === "admin") return -1;
            if (b.role === "admin") return 1;

            return (
              `${a.lastName} ${a.firstName} ${a.middleName}`
            ).localeCompare(
              `${b.lastName} ${b.firstName} ${b.middleName}`,
              "ru"
            );
          })
          .map((managedUser) => (
  <div
    key={managedUser.id}
    className={styles.userRow}
  >
    <div className={styles.userInfo}>
      {managedUser.lastName}{" "}
      {managedUser.firstName}{" "}
      {managedUser.middleName}{" "}
      ({managedUser.role === "admin"
        ? "admin"
        : "user"})
    </div>

    {managedUser.role !== "admin" && (
      <div className={styles.userActions}>
        <button
  className={styles.iconButton}
  aria-label="Редактировать пользователя"
  onClick={() => {
  setEditingUserId(managedUser.id);
  setEditUserLogin(managedUser.login);
  setEditUserCode("");
  setIsEditUserOpen(true);
}}
>
  ✏️
</button>

        <button
  className={styles.iconButton}
  aria-label="Удалить пользователя"
  onClick={() => {
    setDeletingUserId(managedUser.id);
    setIsDeleteUserOpen(true);
  }}
>
  🗑️
</button>
      </div>
    )}
  </div>
))}
      </div>

      <div className={styles.usersFooter}>
        <button
          className={styles.confirmButton}
          onClick={() => setIsUsersManagementOpen(false)}
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
)}
{isDeleteUserOpen && (
  <div className={styles.overlay}>
    <div className={styles.resetModal}>
      <h2>Удалить пользователя?</h2>
      <div className={styles.modalActions}>
        <button
          className={styles.cancelButton}
          onClick={() => {
            setDeletingUserId(null);
            setIsDeleteUserOpen(false);
          }}
        >
          Отмена
        </button>

        <button
          className={styles.confirmButton}
          onClick={async () => {
  if (!deletingUserId) return;

  try {
    const response = await fetch("/api/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: deletingUserId,
      }),
    });

    if (!response.ok) {
      throw new Error();
    }

    await loadUsers();

    setDeletingUserId(null);
    setIsDeleteUserOpen(false);
  } catch {
    alert("Не удалось удалить пользователя");
  }
}}
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
)}
{isEditUserOpen && (
  <div className={styles.overlay}>
    <div className={styles.resetModal}>
      <h2>Изменить данные входа</h2>

      <input
        className={styles.codeInput}
        type="text"
        placeholder="Логин"
        value={editUserLogin}
        onChange={(event) =>
          setEditUserLogin(event.target.value)
        }
      />

      <input
        className={styles.codeInput}
        type="text"
        placeholder="Код"
        value={editUserCode}
        onChange={(event) =>
          setEditUserCode(event.target.value)
        }
      />

      <div className={styles.modalActions}>
        <button
          className={styles.cancelButton}
          onClick={() => {
            setEditingUserId(null);
            setEditUserLogin("");
            setEditUserCode("");
            setIsEditUserOpen(false);
          }}
        >
          Отмена
        </button>

        <button
          className={styles.confirmButton}
          onClick={async () => {
  if (
    !editingUserId ||
    !editUserLogin.trim()
  ) {
    return;
  }

  try {
    const data: {
      id: string;
      login: string;
      accessCode?: string;
    } = {
      id: editingUserId,
      login: editUserLogin.trim(),
    };

    if (editUserCode.trim()) {
      data.accessCode =
        editUserCode.trim();
    }

    const response = await fetch(
      "/api/users",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    await loadUsers();

    setEditingUserId(null);
    setEditUserLogin("");
    setEditUserCode("");
    setIsEditUserOpen(false);
  } catch {
    alert("Не удалось изменить пользователя");
  }
}}
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
)}
      {isAddUserOpen && (
        <div className={styles.overlay}>
          <div className={styles.resetModal}>
            <h2>Новый пользователь</h2>

            <input
  className={styles.codeInput}
  type="text"
  placeholder="ФИО"
  value={newUserFullName}
  onChange={(event) =>
    setNewUserFullName(event.target.value)
  }
/>

            <input
  className={styles.codeInput}
  type="text"
  placeholder="Логин"
  value={newUserLogin}
  onChange={(event) =>
    setNewUserLogin(event.target.value)
  }
/>

            <input
  className={styles.codeInput}
  type="text"
  placeholder="Код"
  value={newUserCode}
  onChange={(event) =>
    setNewUserCode(event.target.value)
  }
/>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setIsAddUserOpen(false)}
              >
                Отмена
              </button>

              <button
  className={styles.confirmButton}
  onClick={async () => {
    const nameParts = newUserFullName
      .trim()
      .split(/\s+/);

    if (
      nameParts.length < 3 ||
      !newUserLogin.trim() ||
      !newUserCode.trim()
    ) {
      alert("Заполните все поля");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastName: nameParts[0],
          firstName: nameParts[1],
          middleName: nameParts.slice(2).join(" "),
          login: newUserLogin.trim(),
          accessCode: newUserCode.trim(),
          role: "employee",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.error ||
            "Не удалось создать пользователя"
        );
        return;
      }

      await loadUsers();

      setNewUserFullName("");
      setNewUserLogin("");
      setNewUserCode("");
      setIsAddUserOpen(false);
    } catch {
      alert("Не удалось создать пользователя");
    }
  }}
>
  Добавить пользователя
</button>
            </div>
          </div>
        </div>
      )}           
      {isResetOpen && (
        <div className={styles.overlay}>
          <div className={styles.resetModal}>
            <h2>Сбросить параметры?</h2>

            <p>
              Все данные профиля и настройки будут удалены.
              Это действие нельзя отменить.
            </p>

            <div className={styles.modalActions}>
              <button
  className={styles.cancelButton}
  onClick={() => setIsResetOpen(false)}
>
  Отмена
</button>

              <button
                className={styles.confirmButton}
                onClick={handleResetProfile}
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {isChangeCodeOpen && (
        <div className={styles.overlay}>
          <div className={styles.resetModal}>
            <h2>Сменить код входа</h2>

            <div className={styles.codeInputWrapper}>
  <input
    className={styles.codeInput}
    type={isOldCodeVisible ? "text" : "password"}
    value={oldCode}
    onChange={(e) => setOldCode(e.target.value)}
    placeholder="Введите старый код"
  />

  <button
    type="button"
    className={styles.eyeButton}
    onClick={() => setIsOldCodeVisible(!isOldCodeVisible)}
  >
    {isOldCodeVisible ? "👁" : "👁"}
  </button>
</div>

            <div className={styles.codeInputWrapper}>
  <input
    className={styles.codeInput}
    type={isNewCodeVisible ? "text" : "password"}
    value={newCode}
    onChange={(e) => setNewCode(e.target.value)}
    placeholder="Введите новый код"
  />

  <button
    type="button"
    className={styles.eyeButton}
    onClick={() => setIsNewCodeVisible(!isNewCodeVisible)}
  >
    {isNewCodeVisible ? "👁" : "👁"}
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
                  setIsChangeCodeOpen(false);
                  setOldCode("");
                  setNewCode("");
                }}
              >
                Отмена
              </button>

              <button
                className={styles.confirmButton}
                onClick={handleChangeCode}
              >
                Сменить
              </button>
            </div>
          </div>
        </div>
      )}
      {isSupportOpen && (
        <div className={styles.overlay}>
          <div className={styles.resetModal}>
            <h2>Помощь и поддержка</h2>

            <p>
              Если вы обнаружили ошибку, приложение работает
              некорректно или возникла другая проблема,
              напишите администратору.
            </p>

            <p>
              По возможности подробно опишите проблему и
              приложите скриншот ошибки или проблемного экрана.
              Это поможет быстрее разобраться и исправить проблему.
            </p>

            <p>
              Администратор:
              <br />
              89990894573 Григорий
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.confirmButton}
                onClick={() => setIsSupportOpen(false)}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
      {isAboutOpen && (
        <div className={styles.overlay}>
          <div className={styles.resetModal}>
            <h2>О приложении</h2>

            <p>
              Ваш личный калькулятор зарплаты и работы.
            </p>

            <p>
              Следите за своим заработком, смотрите прогноз
              будущей зарплаты, количество собранных коробок и
              блоков, рабочие часы и подробную статистику.
            </p>

            <p>
              Приложение также помогает контролировать график и
              смены, отслеживать авансы и выплаты заработной платы,
              а также учитывать отпуск, больничный и другие важные
              события.
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.confirmButton}
                onClick={() => setIsAboutOpen(false)}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )} 
      {isLogoutOpen && (
        <div className={styles.overlay}>
          <div className={styles.resetModal}>
            <h2>Выйти из профиля?</h2>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setIsLogoutOpen(false)}
              >
                Отмена
              </button>

              <button
                className={styles.confirmButton}
                onClick={handleLogout}
              >
                Выйти
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
    </main>
  );
}
