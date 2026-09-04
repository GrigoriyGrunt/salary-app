import type { Payment } from "@/store/financeStore";

type PaymentNotification = {
  id: string;
  type: "reminder" | "warning";
  title: string;
  lines: string[];
  action?: {
    monthKey: string;
    paymentType: "Аванс" | "Зарплата";
    date: string;
  };
};

const holidays = [
  "01-01",
  "01-02",
  "01-03",
  "01-04",
  "01-05",
  "01-06",
  "01-07",
  "01-08",
  "02-23",
  "03-08",
  "05-01",
  "05-09",
  "06-12",
  "11-04",
];

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthName(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
  }).format(date);
}

function getDateLabel(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(date);
}
function formatPaymentDate(date: Date) {
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}
function isWorkingDay(date: Date) {
  const day = date.getDay();

  if (day === 0 || day === 6) {
    return false;
  }

  const holidayKey = `${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

  return !holidays.includes(holidayKey);
}

function getPreviousWorkingDay(date: Date) {
  const result = new Date(date);

  while (!isWorkingDay(result)) {
    result.setDate(result.getDate() - 1);
  }

  return result;
}

function getAdvanceDate(year: number, month: number) {
  return getPreviousWorkingDay(
    new Date(year, month, 25)
  );
}

function getSalaryDate(year: number, month: number) {
  return getPreviousWorkingDay(
    new Date(year, month + 1, 10)
  );
}

function parsePaymentDate(value: string) {
  const isoMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    );
  }

  const ruMatch = value.match(
    /^(\d{2})\.(\d{2})\.(\d{4})$/
  );

  if (ruMatch) {
    return new Date(
      Number(ruMatch[3]),
      Number(ruMatch[2]) - 1,
      Number(ruMatch[1])
    );
  }

  return null;
}

function isSameOrAfter(
  date: Date,
  target: Date
) {
  const left = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const right = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );

  return left.getTime() >= right.getTime();
}

function getMonthDate(monthKey: string) {
  const [year, month] = monthKey
    .split("-")
    .map(Number);

  return new Date(year, month - 1, 1);
}

export function getPaymentNotifications(
  payments: Payment[],
  now: Date
): PaymentNotification[] {
  const notifications: PaymentNotification[] = [];

  const currentMonthKey = getMonthKey(now);

  const previousMonthDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const previousMonthKey =
    getMonthKey(previousMonthDate);

  const currentAdvanceDate =
    getAdvanceDate(
      now.getFullYear(),
      now.getMonth()
    );

  const previousSalaryDate =
    getSalaryDate(
      previousMonthDate.getFullYear(),
      previousMonthDate.getMonth()
    );

  const isAfter16 =
    now.getHours() >= 16;

  const currentMonthPayments =
    payments.filter(
      (payment) =>
        payment.monthKey ===
        currentMonthKey
    );

  const previousMonthPayments =
    payments.filter(
      (payment) =>
        payment.monthKey ===
        previousMonthKey
    );

        const wrongMonthAdvance =
    payments.find(
      (payment) => {
        if (
          payment.type !== "Аванс"
        ) {
          return false;
        }

        const paymentDate =
          parsePaymentDate(payment.date);

        if (!paymentDate) {
          return false;
        }

        const paymentMonthKey =
          getMonthKey(paymentDate);

        return (
          paymentMonthKey ===
            currentMonthKey &&
          payment.monthKey !==
            paymentMonthKey
        );
      }
    );

  const wrongMonthSalary =
    currentMonthPayments.find(
      (payment) =>
        payment.type === "Зарплата" &&
        isSameOrAfter(
          now,
          previousSalaryDate
        )
    );

  const earlyAdvance =
    currentMonthPayments.find(
      (payment) => {
        if (
          payment.type !== "Аванс"
        ) {
          return false;
        }

        const paymentDate =
          parsePaymentDate(payment.date);

        return (
          paymentDate !== null &&
          paymentDate.getTime() <
            currentAdvanceDate.getTime()
        );
      }
    );

  const earlySalary =
    previousMonthPayments.find(
      (payment) => {
        if (
          payment.type !== "Зарплата"
        ) {
          return false;
        }

        const paymentDate =
          parsePaymentDate(payment.date);

        return (
          paymentDate !== null &&
          paymentDate.getTime() <
            previousSalaryDate.getTime()
        );
      }
    );

  const hasCorrectAdvance =
    currentMonthPayments.some(
      (payment) => {
        if (
          payment.type !== "Аванс"
        ) {
          return false;
        }

        const paymentDate =
          parsePaymentDate(payment.date);

        return (
          paymentDate !== null &&
          paymentDate.getTime() >=
            currentAdvanceDate.getTime()
        );
      }
    );

  const hasCorrectSalary =
    previousMonthPayments.some(
      (payment) => {
        if (
          payment.type !== "Зарплата"
        ) {
          return false;
        }

        const paymentDate =
          parsePaymentDate(payment.date);

        return (
          paymentDate !== null &&
          paymentDate.getTime() >=
            previousSalaryDate.getTime()
        );
      }
    );

  if (wrongMonthAdvance) {
    notifications.push({
      id: "advance-wrong-month",
      type: "warning",
      title:
        "⚠️ Проверьте поступление",
      lines: [
        `Аванс за ${getMonthName(
          now
        )} внесён не в текущий месяц.`,
        `Переключите месяц на ${getMonthName(
          now
        )} и внесите поступление туда.`,
      ],
    });
  }

  if (wrongMonthSalary) {
    notifications.push({
      id: "salary-wrong-month",
      type: "warning",
      title:
        "⚠️ Проверьте поступление",
      lines: [
        `Зарплата за ${getMonthName(
          previousMonthDate
        )} внесена в ${getMonthName(
          now
        )}.`,
        `Переключите месяц на ${getMonthName(
          previousMonthDate
        )} и внесите поступление туда.`,
      ],
    });
  }

  if (earlyAdvance) {
    notifications.push({
      id:
        "advance-early-payment",
      type: "warning",
      title:
        "⚠️ Проверьте поступление",
      lines: [
        `Были внесены данные по поступлению аванса за ${getMonthName(
          now
        )}.`,
        `Дата поступления должна быть ${getDateLabel(
          currentAdvanceDate
        )}.`,
      ],
    });
  }

  if (earlySalary) {
    notifications.push({
      id:
        "salary-early-payment",
      type: "warning",
      title:
        "⚠️ Проверьте поступление",
      lines: [
        `Были внесены данные по поступлению зарплаты за ${getMonthName(
          previousMonthDate
        )}.`,
        `Дата поступления должна быть ${getDateLabel(
          previousSalaryDate
        )}.`,
      ],
    });
  }

  const hasAdvanceWarning =
    Boolean(
      wrongMonthAdvance ||
      earlyAdvance
    );

  const hasSalaryWarning =
    Boolean(
      wrongMonthSalary ||
      earlySalary
    );

  if (
    isAfter16 &&
    isSameOrAfter(
      now,
      currentAdvanceDate
    ) &&
    !hasCorrectAdvance &&
    !hasAdvanceWarning
  ) {
    const isToday =
      now.getFullYear() ===
        currentAdvanceDate.getFullYear() &&
      now.getMonth() ===
        currentAdvanceDate.getMonth() &&
      now.getDate() ===
        currentAdvanceDate.getDate();

    notifications.push({
  id: "advance-reminder",
  type: "reminder",
  title: isToday
    ? "Сегодня аванс"
    : "Внесите данные по поступлению аванса",
  lines: [
    isToday
      ? `Сегодня должен поступить аванс за ${getMonthName(
          now
        )}.`
      : `${getDateLabel(
          currentAdvanceDate
        )} должен был поступить аванс за ${getMonthName(
          now
        )}.`,
  ],
  action: {
    monthKey: currentMonthKey,
    paymentType: "Аванс",
    date: formatPaymentDate(
      currentAdvanceDate
    ),
  },
});
  }

  if (
    isAfter16 &&
    isSameOrAfter(
      now,
      previousSalaryDate
    ) &&
    !hasCorrectSalary &&
    !hasSalaryWarning
  ) {
    const isToday =
      now.getFullYear() ===
        previousSalaryDate.getFullYear() &&
      now.getMonth() ===
        previousSalaryDate.getMonth() &&
      now.getDate() ===
        previousSalaryDate.getDate();

    notifications.push({
  id: "salary-reminder",
  type: "reminder",
  title: isToday
    ? "Сегодня зарплата"
    : "Внесите данные по поступлению зарплаты",
  lines: [
    isToday
      ? `Сегодня должна поступить зарплата за ${getMonthName(
          previousMonthDate
        )}.`
      : `${getDateLabel(
          previousSalaryDate
        )} должна была поступить зарплата за ${getMonthName(
          previousMonthDate
        )}.`,
  ],
  action: {
    monthKey: previousMonthKey,
    paymentType: "Зарплата",
    date: formatPaymentDate(
      previousSalaryDate
    ),
  },
});
  }

  return notifications;
}