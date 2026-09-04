"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  getShiftNotifications,
} from "@/lib/getShiftNotifications";
import {
  getPaymentNotifications,
} from "@/lib/getPaymentNotifications";

import Logo from "@/components/Logo/Logo";
import Image from "next/image";

import styles from "./PageHeader.module.css";

import { useUsersStore } from "@/store/usersStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useFinanceStore } from "@/store/financeStore";
import {
  useNotificationStore,
} from "@/store/notificationStore";
import {
  getScheduleNotification,
} from "@/lib/getScheduleNotification";

type PageHeaderProps = {
  title: string;
  variant?: "default" | "home";
};

export default function PageHeader({
  title,
  variant = "default",
}: PageHeaderProps) {
    const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);
    const [now, setNow] = useState(
  () => new Date()
);

useEffect(() => {
  const interval = setInterval(() => {
    setNow(new Date());
  }, 60 * 1000);

  return () => clearInterval(interval);
}, []);
  const currentUser = useUsersStore(
    (state) => state.currentUser
  );

  const shifts = useScheduleStore(
    (state) => state.shifts
  );
  const payments = useFinanceStore(
  (state) => state.payments
);
const goal = useFinanceStore(
  (state) => state.goal
);

const syncGoalMonth =
  useFinanceStore(
    (state) =>
      state.syncGoalMonth
  );
  useEffect(() => {
  syncGoalMonth();
}, [now, syncGoalMonth]);
  const dismissedNotifications =
    useNotificationStore(
      (state) =>
        state.dismissedNotifications
    );

  const dismissNotification =
    useNotificationStore(
      (state) =>
        state.dismissNotification
    );

  const originalMainShiftsByMonth =
    useScheduleStore(
      (state) =>
        state.originalMainShiftsByMonth
    );

  const firstName =
    currentUser?.firstName || "Пользователь";

  const currentDate = new Intl.DateTimeFormat(
    "ru-RU",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  ).format(new Date());

  const formattedDate =
    currentDate.charAt(0).toUpperCase() +
    currentDate.slice(1);

  const notification =
    getScheduleNotification(
      shifts,
      originalMainShiftsByMonth
    );
    const shiftNotifications =
  getShiftNotifications(
    shifts,
    now
  );
  const paymentNotifications =
  getPaymentNotifications(
    payments,
    now
  );

  const getMonthKey = (
    date: Date
  ) => {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
  };

  const currentMonthKey =
    getMonthKey(now);
const motivationNotificationId =
  `motivation-${currentMonthKey}`;

const hasMotivationNotification =
  goal === 0 &&
  !dismissedNotifications.includes(
    motivationNotificationId
  );
  const visibleShiftNotifications =
    shiftNotifications.filter(
      (shiftNotification) => {
        const notificationId =
          `shift-${getMonthKey(
            shiftNotification.date
          )}-${shiftNotification.date.getDate()}`;

        return !dismissedNotifications.includes(
          notificationId
        );
      }
    );

  const visiblePaymentNotifications =
    paymentNotifications.filter(
      (paymentNotification) => {
        if (
          paymentNotification.type !==
          "reminder"
        ) {
          return true;
        }

        const notificationId =
          `${paymentNotification.id}-${currentMonthKey}`;

        return !dismissedNotifications.includes(
          notificationId
        );
      }
    );

  const notificationsCount =
  visibleShiftNotifications.length +
  visiblePaymentNotifications.length +
  (notification ? 1 : 0) +
  (hasMotivationNotification ? 1 : 0);

  const notificationDate =
    notification
      ? new Intl.DateTimeFormat(
          "ru-RU",
          {
            day: "numeric",
            month: "long",
          }
        ).format(notification.date)
      : "";

  if (variant === "home") {
    return (
      <header
        className={`${styles.header} ${styles.homeHeader}`}
      >
        <div className={styles.homeLeft}>
          <Logo />

          <h2 className={styles.homeTitle}>
            Здравствуйте, {firstName}
          </h2>

          <p className={styles.date}>
            {formattedDate}
          </p>
        </div>

        <div className={styles.notificationWrapper}>
          <button
            className={styles.notification}
            onClick={() =>
              setIsNotificationsOpen(
                !isNotificationsOpen
              )
            }
            aria-label="Уведомления"
          >
            <Image
              src="/images/icons/notifications.png"
              alt=""
              width={16}
              height={16}
            />

            {notificationsCount > 0 && (
  <span className={styles.badge}>
    {notificationsCount}
  </span>
)}
          </button>

          {isNotificationsOpen && (
            <div
              className={styles.notificationPanel}
            >
{hasMotivationNotification && (
  <div
    className={
      styles.notificationCard
    }
  >
    <button
      type="button"
      className={
        styles.notificationClose
      }
      onClick={() =>
        dismissNotification(
          motivationNotificationId
        )
      }
      aria-label="Закрыть уведомление"
    >
      <X size={18} />
    </button>

    <h3>
      🎯 Укажите цель на месяц
    </h3>

    <p>
      Укажите цель средней
      производительности для
      расчёта прогноза в разделе
      «Мотивация» на главном экране,
      нажав «Подробнее».
    </p>
  </div>
)}
              {notification && (
  <div
    className={
      styles.notificationCard
    }
  >
    <h3>
      ⚠️ Проверьте график
    </h3>

    <p>
      В этом месяце должно быть{" "}
      <strong>
        {notification.originalMainShifts}
      </strong>{" "}
      обязательных смен, сейчас —{" "}
      <strong>
        {notification.requiredShifts}
      </strong>.
    </p>

    <p>
      Рекомендуем проверить смену{" "}
      <strong>
        {notificationDate}
      </strong>{" "}
      и изменить её тип с{" "}
      <strong>
        «{notification.from}»
      </strong>{" "}
      на{" "}
      <strong>
        «{notification.to}»
      </strong>.
    </p>

    <p
      className={
        styles.notificationWarning
      }
    >
      Если не изменить тип смены,
      расчёт зарплаты может быть
      неверным.
    </p>
  </div>
)}

{visibleShiftNotifications.map(
  (shiftNotification) => {
    const date =
      new Intl.DateTimeFormat(
        "ru-RU",
        {
          day: "numeric",
          month: "long",
        }
      ).format(
        shiftNotification.date
      );

    const notificationId =
      `shift-${getMonthKey(
        shiftNotification.date
      )}-${shiftNotification.date.getDate()}`;

    return (
      <div
        key={notificationId}
        className={
          styles.shiftNotificationCard
        }
      >
        <span
          className={
            styles.shiftNotificationIcon
          }
        >
          ⚠️
        </span>

        <span>
          Внесите данные по рабочей смене за{" "}
          <strong>{date}</strong>
        </span>

        <button
          type="button"
          className={
            styles.notificationClose
          }
          onClick={() =>
            dismissNotification(
              notificationId
            )
          }
          aria-label="Закрыть уведомление"
        >
          <X size={18} />
        </button>
      </div>
    );
  }
)}
{visiblePaymentNotifications.map(
  (paymentNotification) => {
    const notificationId =
      `${paymentNotification.id}-${currentMonthKey}`;

    const canDismiss =
      paymentNotification.type ===
      "reminder";

    return (
      <div
        key={paymentNotification.id}
        className={
          styles.notificationCard
        }
      >
        {canDismiss && (
          <button
            type="button"
            className={
              styles.notificationClose
            }
            onClick={() =>
              dismissNotification(
                notificationId
              )
            }
            aria-label="Закрыть уведомление"
          >
            <X size={18} />
          </button>
        )}

        <h3>
          {paymentNotification.title}
        </h3>

        {paymentNotification.lines.map(
          (line, index) => (
            <p key={index}>
              {line}
            </p>
          )
        )}
{paymentNotification.action && (
  <button
    type="button"
    className={styles.addPaymentButton}
    onClick={() => {
  const action =
    paymentNotification.action;

  if (!action) {
    return;
  }

  const params =
    new URLSearchParams({
      month: action.monthKey,
      paymentType:
        action.paymentType,
      paymentDate: action.date,
    });

  setIsNotificationsOpen(false);

  router.push(
    `/money?${params.toString()}`
  );
}}
  >
    Добавить поступление
  </button>
)}
      </div>
    );
  }
)}
{notificationsCount === 0 && (
  <div
    className={
      styles.emptyNotifications
    }
  >
    Новых уведомлений нет
  </div>
)}
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.back}>
        <ChevronLeft
          size={24}
          strokeWidth={2.5}
        />
      </Link>

      <div className={styles.title}>
        <Logo variant="icon" />
        <span>{title}</span>
      </div>

      <div className={styles.right} />
    </header>
  );
}