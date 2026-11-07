"use client";

import {
  useShiftEditor,
} from "@/components/common/ShiftEditorProvider/ShiftEditorProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
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
function toDateKey(value: Date | string | null | undefined) {
  if (!value) return null;

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const dateKey = String(value).slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
    ? dateKey
    : null;
}
export default function PageHeader({
  title,
  variant = "default",
}: PageHeaderProps) {
    const router = useRouter();
    const { openShiftEditor } = useShiftEditor();
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);
    const notificationWrapperRef =
  useRef<HTMLDivElement>(null);

const notificationPanelRef =
  useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

const [notificationPosition, setNotificationPosition] = useState({
  top: 0,
  right: 12,
});
    const [now, setNow] = useState(
  () => new Date()
);

useEffect(() => {
  const interval = setInterval(() => {
    setNow(new Date());
  }, 60 * 1000);

  return () => clearInterval(interval);
}, []);
useEffect(() => {
  if (!isNotificationsOpen) {
    return;
  }

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;

    if (
  !notificationWrapperRef.current?.contains(target) &&
  !notificationPanelRef.current?.contains(target)
) {
  setIsNotificationsOpen(false);
}
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, [isNotificationsOpen]);
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
const goalPeriodKey = useFinanceStore(
  (state) => state.goalPeriodKey
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

  const getMonthKey = (
    date: Date
  ) => {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
  };

 const currentMonthKey = getMonthKey(now);
 const scheduleNotificationId =
  `schedule-${currentMonthKey}`;

const lastScheduleChange =
  currentUser?.scheduleChanges?.[
    (currentUser.scheduleChanges?.length ?? 1) - 1
  ];

const activeSchedule =
  lastScheduleChange?.schedule ?? currentUser?.schedule;

const watchFirstDate =
  lastScheduleChange?.firstShiftDate ??
  currentUser?.firstShiftDate;

const watchSecondDate =
  lastScheduleChange?.secondShiftDate ??
  currentUser?.secondShiftDate;

const isWatchMotivation =
  currentUser?.position === "Комплектовщик основы" &&
  activeSchedule === "15/15 вахта";
const watchPeriods = isWatchMotivation && currentUser
  ? [
      {
        startDate: toDateKey(currentUser.firstShiftDate),
        endDate: toDateKey(currentUser.secondShiftDate),
      },
      ...(currentUser.scheduleChanges ?? [])
        .filter((change) => change.schedule === "15/15 вахта")
        .map((change) => ({
          startDate: toDateKey(change.firstShiftDate),
          endDate: toDateKey(change.secondShiftDate),
        })),
    ]
      .filter(
        (period): period is { startDate: string; endDate: string } =>
          Boolean(
            period.startDate &&
            period.endDate &&
            period.endDate >= period.startDate
          )
      )
      .reduce((unique, period) => {
        if (
          !unique.some(
            (item) =>
              item.startDate === period.startDate &&
              item.endDate === period.endDate
          )
        ) {
          unique.push(period);
        }
        return unique;
      }, [] as { startDate: string; endDate: string }[])
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
  : undefined;
    const paymentNotifications =
  getPaymentNotifications(
    payments,
    now,
    watchPeriods
  );
const watchPeriodKey =
  isWatchMotivation && watchFirstDate && watchSecondDate
    ? `${new Date(watchFirstDate).toISOString().slice(0, 10)}-${new Date(watchSecondDate).toISOString().slice(0, 10)}`
    : null;

const motivationNotificationId = isWatchMotivation
  ? `motivation-${watchPeriodKey}`
  : `motivation-${currentMonthKey}`;

const today = new Date(now);
today.setHours(0, 0, 0, 0);

const watchStart = watchFirstDate
  ? new Date(watchFirstDate)
  : null;

const watchEnd = watchSecondDate
  ? new Date(watchSecondDate)
  : null;

watchStart?.setHours(0, 0, 0, 0);
watchEnd?.setHours(0, 0, 0, 0);
const shiftNotifications = getShiftNotifications(
  shifts,
  now,
  isWatchMotivation && watchStart && watchEnd
    ? {
        start: watchStart,
        end: watchEnd,
      }
    : null
);
const isInsideWatchPeriod =
  watchStart !== null &&
  watchEnd !== null &&
  today >= watchStart &&
  today <= watchEnd;

const hasMotivationNotification = isWatchMotivation
  ? isInsideWatchPeriod &&
    goalPeriodKey !== watchPeriodKey &&
    !dismissedNotifications.includes(
      motivationNotificationId
    )
  : goal === 0 &&
    !dismissedNotifications.includes(
      motivationNotificationId
    );
  const visibleScheduleNotification =
  notification &&
  !dismissedNotifications.includes(
    scheduleNotificationId
  )
    ? notification
    : null;
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
  (visibleScheduleNotification ? 1 : 0) +
  (hasMotivationNotification ? 1 : 0);
const clearAllNotifications = async () => {
  const notificationIds: string[] = [];

  if (hasMotivationNotification) {
    notificationIds.push(
      motivationNotificationId
    );
  }

  if (visibleScheduleNotification) {
    notificationIds.push(
      scheduleNotificationId
    );
  }

  visibleShiftNotifications.forEach(
    (shiftNotification) => {
      notificationIds.push(
        `shift-${getMonthKey(
          shiftNotification.date
        )}-${shiftNotification.date.getDate()}`
      );
    }
  );

  visiblePaymentNotifications.forEach(
    (paymentNotification) => {
      if (
        paymentNotification.type ===
        "reminder"
      ) {
        notificationIds.push(
          `${paymentNotification.id}-${currentMonthKey}`
        );
      }
    }
  );

  await Promise.all(
    notificationIds.map((id) =>
      dismissNotification(id)
    )
  );
};
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
useEffect(() => {
  if (!isNotificationsOpen) return;

  const updatePosition = () => {
    const button = notificationButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const panelWidth = Math.min(340, window.innerWidth - 24);
    const desiredRight = window.innerWidth - rect.right;
    const maxRight = window.innerWidth - panelWidth - 12;

    const panel = notificationPanelRef.current;
    const panelHeight = panel?.getBoundingClientRect().height ?? 0;
    const maxTop = window.innerHeight - panelHeight - 12;

    setNotificationPosition({
      top: Math.min(rect.bottom + 8, Math.max(12, maxTop)),
      right: Math.max(12, Math.min(desiredRight, maxRight)),
    });
  };

  updatePosition();

  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);

  return () => {
    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("scroll", updatePosition, true);
  };
}, [isNotificationsOpen]);
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

        <div
  className={styles.notificationWrapper}
  ref={notificationWrapperRef}
>
          <button
  ref={notificationButtonRef}
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

{isNotificationsOpen &&
  typeof document !== "undefined" &&
  createPortal(
    <div
      className={styles.notificationPanel}
      ref={notificationPanelRef}
      style={{
        top: notificationPosition.top,
        right: notificationPosition.right,
      }}
    >
    <div className={styles.notificationHeader}>
      <h3>Уведомления</h3>

      <div className={styles.notificationHeaderActions}>
        <button
          type="button"
          className={styles.clearNotificationsButton}
          disabled={notificationsCount === 0}
          onClick={clearAllNotifications}
        >
          Очистить всё
        </button>

        <button
          type="button"
          className={styles.notificationPanelClose}
          onClick={() =>
            setIsNotificationsOpen(false)
          }
          aria-label="Закрыть уведомления"
        >
          <X size={22} />
        </button>
      </div>
    </div>

    <div className={styles.notificationList}>
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
  🎯 {isWatchMotivation
    ? "Укажите цель на вахту"
    : "Укажите цель на месяц"}
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
              {visibleScheduleNotification && (
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
      scheduleNotificationId
    )
  }
  aria-label="Закрыть уведомление"
>
  <X size={18} />
</button>
    <h3>
      ⚠️ Проверьте график
    </h3>

    <p>
      В этом месяце должно быть{" "}
      <strong>
  {visibleScheduleNotification.originalMainShifts}
</strong>{" "}
      обязательных смен, сейчас —{" "}
      <strong>
  {visibleScheduleNotification.requiredShifts}
</strong>.
    </p>

    <p>
      Рекомендуем проверить смену{" "}
      <strong>
        {notificationDate}
      </strong>{" "}
      и изменить её тип с{" "}
      <strong>
  «{visibleScheduleNotification.from}»
</strong>{" "}
      на{" "}
      <strong>
  «{visibleScheduleNotification.to}»
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

        <div>
  <span>
    Внесите данные по рабочей смене за{" "}
    <strong>{date}</strong>
  </span>

  <button
    type="button"
    className={styles.addPaymentButton}
    onClick={() => {
      setIsNotificationsOpen(false);
      openShiftEditor(new Date(shiftNotification.date));
    }}
  >
    Внести данные
  </button>
</div>

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

const params = new URLSearchParams({
  month: action.monthKey,
  paymentType: action.paymentType,
  paymentDate: action.date,
});

if (action.periodKey) {
  params.set("periodKey", action.periodKey);
}

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
  </div>,
  document.body
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