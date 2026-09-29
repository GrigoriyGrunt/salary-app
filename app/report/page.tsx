"use client";

import { useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader/PageHeader";
import BottomNavigation from "@/components/navigation/BottomNavigation";

import { useUsersStore } from "@/store/usersStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useFinanceStore } from "@/store/financeStore";

import { calculateMonthlyReport } from "@/lib/report";

import styles from "./page.module.css";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString(
    "ru-RU"
  )} ₽`;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString(
    "ru-RU"
  );
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthName(date: Date) {
  const name = date.toLocaleString(
    "ru-RU",
    {
      month: "long",
      year: "numeric",
    }
  );

  return (
    name.charAt(0).toUpperCase() +
    name.slice(1)
  );
}

function getDateLabel(date: Date) {
  return date.toLocaleDateString(
    "ru-RU",
    {
      day: "numeric",
      month: "long",
    }
  );
}

function ReportRow({
  label,
  value,
  show = true,
}: {
  label: string;
  value: React.ReactNode;
  show?: boolean;
}) {
  if (!show) {
    return null;
  }

  return (
    <div className={styles.row}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function ReportPage() {
  const [selectedDate, setSelectedDate] =
    useState(() => {
      const now = new Date();

      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    });

  const user = useUsersStore(
    (state) => state.currentUser
  );

  const shifts = useScheduleStore(
    (state) => state.shifts
  );

  const originalMainShiftsByMonth =
    useScheduleStore(
      (state) =>
        state.originalMainShiftsByMonth
    );

  const deductions = useFinanceStore(
    (state) => state.deductions
  );

  const premiums = useFinanceStore(
    (state) => state.premiums
  );

  const payments = useFinanceStore(
    (state) => state.payments
  );

  const report = useMemo(() => {
    if (!user) {
      return null;
    }

    return calculateMonthlyReport(
      {
        user,
        shifts,
        originalMainShiftsByMonth,
        deductions,
        premiums,
        payments,
      },
      selectedDate
    );
  }, [
    user,
    shifts,
    originalMainShiftsByMonth,
    deductions,
    premiums,
    payments,
    selectedDate,
  ]);

  const goPreviousMonth = () => {
    setSelectedDate(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() - 1,
        1
      )
    );
  };

  const goNextMonth = () => {
    setSelectedDate(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        1
      )
    );
  };

  const monthKey =
    getMonthKey(selectedDate);

  const handleMonthChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      event.target.value;

    if (
      !/^\d{4}-\d{2}$/.test(value)
    ) {
      return;
    }

    const [year, month] =
      value.split("-").map(Number);

    setSelectedDate(
      new Date(
        year,
        month - 1,
        1
      )
    );
  };
  const handleShare = async () => {
    if (!report) return;

    const text = [
      `📊 Отчёт за ${getMonthName(selectedDate)}`,
      ``,
      `Смены`,
      `Всего отработано: ${report.workedShifts}`,
      `Основных по графику: ${report.originalMainShifts}`,
      `Подработка: ${report.extraWorked}`,
      `Отработка: ${report.overtimeWorked}`,
      ``,
      `Выработка`,
      `Коробок собрано: ${formatNumber(report.totalBoxes)}`,
      `Средняя по коробкам: ${formatNumber(report.averageBoxes)}`,
      `Заработано за коробки: ${formatMoney(report.salaryFromBoxes)}`,
      ``,
      `Рабочее время`,
      `Всего часов: ${formatNumber(report.totalActualHours)}`,
      `По основному графику: ${formatNumber(report.mainHours)} ч. — ${formatMoney(report.mainSalary)}`,
      `Подработка: ${formatNumber(report.extraHours)} ч. — ${formatMoney(report.extraSalary)}`,
      `Отработка: ${formatNumber(report.overtimeHours)} ч. — ${formatMoney(report.overtimeSalary)}`,
      `Ночные: ${formatNumber(report.nightHours)} ч. — ${formatMoney(report.nightSurcharge)}`,
      ``,
      `ИТОГО: ${formatMoney(report.totalSalary)}`,
      `Выплачено: ${formatMoney(report.totalPaid)}`,
      `Разница: ${formatMoney(report.balance)}`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Отчёт за ${getMonthName(selectedDate)}`,
          text,
        });

        return;
      }

      await navigator.clipboard.writeText(text);
      alert("Отчёт скопирован в буфер обмена");
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        alert("Отчёт скопирован в буфер обмена");
      } catch {
        alert("Не удалось поделиться отчётом");
      }
    }
  };

  if (!report) {
    return (
      <main className={styles.page}>
        <PageHeader title="Отчёт" />

        <div className={styles.content}>
          <div
            className={
              styles.scrollContent
            }
          >
            <div className={styles.empty}>
              Нет данных пользователя
            </div>
          </div>
        </div>

        <BottomNavigation />
      </main>
    );
  }

  const monthShifts =
    shifts.filter((shift) => {
      const date =
        new Date(shift.date);

      return (
        date.getFullYear() ===
          selectedDate.getFullYear() &&
        date.getMonth() ===
          selectedDate.getMonth()
      );
    });

  const hasData =
    monthShifts.length > 0 ||
    report.originalMainShifts > 0 ||
    report.premiums.length > 0 ||
    report.deductions.length > 0;

  return (
  <main className={styles.page}>
    <div className={styles.reportHeader}>
      <PageHeader title="Отчёт" />

      <button
  className={styles.shareButton}
  onClick={handleShare}
  type="button"
  aria-label="Поделиться отчётом"
>
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 15V3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 7L12 3L16 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 11V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
</button>
    </div>

    <div className={styles.content}>
        <div
          className={
            styles.scrollContent
          }
        >
          <section
            className={
              styles.periodCard
            }
          >
            <button
              className={
                styles.periodArrow
              }
              onClick={
                goPreviousMonth
              }
              type="button"
              aria-label="Предыдущий месяц"
            >
              ‹
            </button>

            <label
              className={
                styles.periodCenter
              }
            >
              <span
                className={
                  styles.periodTitle
                }
              >
                {getMonthName(
                  selectedDate
                )}
              </span>

              <input
                className={
                  styles.monthInput
                }
                type="month"
                value={monthKey}
                onChange={
                  handleMonthChange
                }
                aria-label="Выбрать месяц"
              />
            </label>

            <button
              className={
                styles.periodArrow
              }
              onClick={
                goNextMonth
              }
              type="button"
              aria-label="Следующий месяц"
            >
              ›
            </button>
          </section>

          {!hasData ? (
            <section
              className={
                styles.emptyCard
              }
            >
              <h2>Нет данных</h2>

              <p>
                За выбранный месяц
                пока нет данных.
              </p>
            </section>
          ) : (
            <>
              <section
                className={styles.card}
              >
                <h2
                  className={
                    styles.cardTitle
                  }
                >
                  Смены
                </h2>

                <div
                  className={
                    styles.rows
                  }
                >
                  <ReportRow
                    label="Всего отработано"
                    value={
                      report.workedShifts
                    }
                    show={
                      report.workedShifts !==
                      0
                    }
                  />

                  <ReportRow
                    label="Основных по графику"
                    value={
                      report.originalMainShifts
                    }
                    show={
                      report.originalMainShifts !==
                      0
                    }
                  />

                  <ReportRow
                    label="Подработка"
                    value={
                      report.extraWorked
                    }
                    show={
                      report.extraWorked !==
                      0
                    }
                  />

                  <ReportRow
                    label="Отработка"
                    value={
                      report.overtimeWorked
                    }
                    show={
                      report.overtimeWorked !==
                      0
                    }
                  />

                  <ReportRow
                  label="День отдыха (ДО)"
                  value={report.dayOffCount}
                  show={report.dayOffCount !== 0}
                  />

                  <ReportRow
                    label="Прогулы"
                    value={
                      report.absences
                    }
                    show={
                      report.absences !==
                      0
                    }
                  />

                  <ReportRow
                    label="Больничных"
                    value={
                      report.sickDays
                    }
                    show={
                      report.sickDays !==
                      0
                    }
                  />

                  <ReportRow
                    label="Отпусков"
                    value={
                      report.vacations
                    }
                    show={
                      report.vacations !==
                      0
                    }
                  />
                </div>
              </section>

              <section
                className={styles.card}
              >
                <h2
                  className={
                    styles.cardTitle
                  }
                >
                  Выроботка
                </h2>

                <div
                  className={
                    styles.rows
                  }
                >
                  <ReportRow
                    label="Коробок собрано"
                    value={formatNumber(
                      report.totalBoxes
                    )}
                    show={
                      report.totalBoxes !==
                      0
                    }
                  />

                  <ReportRow
                    label="Средняя по коробкам"
                    value={formatNumber(
                      report.averageBoxes
                    )}
                    show={
                      report.averageBoxes !==
                      0
                    }
                  />

                  <ReportRow
                    label="Ставка за коробку"
                    value={`${report.boxRate} ₽`}
                    show={
                      report.boxRate !==
                      0
                    }
                  />

                  <ReportRow
                    label="Заработано за коробки"
                    value={formatMoney(
                      report.salaryFromBoxes
                    )}
                    show={
                      report.salaryFromBoxes !==
                      0
                    }
                  />

                  <ReportRow
                    label="Блоков собрано"
                    value={formatNumber(
                      report.totalBlocks
                    )}
                    show={
                      report.totalBlocks !==
                      0
                    }
                  />

                  <ReportRow
                    label="Средняя по блокам"
                    value={formatNumber(
                      report.averageBlocks
                    )}
                    show={
                      report.averageBlocks !==
                      0
                    }
                  />

                  <ReportRow
                    label="Ставка за блок"
                    value={`${report.blockRate} ₽`}
                    show={
                      report.blockRate !==
                      0
                    }
                  />

                  <ReportRow
                    label="Заработано за блоки"
                    value={formatMoney(
                      report.salaryFromBlocks
                    )}
                    show={
                      report.salaryFromBlocks !==
                      0
                    }
                  />
                  <div className={styles.totalDivider} />

<div className={styles.totalTitle}>
  Итого
</div>

<ReportRow
  label="Всего заработано"
  value={formatMoney(
    report.salaryFromBoxes +
      report.salaryFromBlocks
  )}
  show={
    report.salaryFromBoxes +
      report.salaryFromBlocks !==
    0
  }
/>
                </div>
              </section>

              <section
  className={styles.card}
>
  <h2
    className={
      styles.cardTitle
    }
  >
    Рабочее время
  </h2>

  <div
    className={
      styles.rows
    }
  >

    <ReportRow
      label="По основному графику"
      value={`${formatNumber(
        report.mainHours
      )} ч. (${formatMoney(
        report.mainSalary
      )})`}
      show={
        report.mainHours !==
        0
      }
    />

    <ReportRow
      label="Выход в подработки"
      value={`${formatNumber(
        report.extraHours
      )} ч. (${formatMoney(
        report.extraSalary
      )})`}
      show={
        report.extraHours !==
        0
      }
    />

    <ReportRow
      label="Отработка"
      value={`${formatNumber(
        report.overtimeHours
      )} ч. (${formatMoney(
        report.overtimeSalary
      )})`}
      show={
        report.overtimeHours !==
        0
      }
    />

    <ReportRow
      label="Ночные часы"
      value={`${formatNumber(
        report.nightHours
      )} ч. (${formatMoney(
        report.nightSurcharge
      )})`}
      show={
        report.nightHours !==
        0
      }
    />

    <ReportRow
      label="Непрофильные часы"
      value={`${formatNumber(
        report.totalNonProfileHours
      )} ч. (${formatMoney(
        report.salaryFromNonProfileHours
      )})`}
      show={
        report.totalNonProfileHours !==
        0
      }
    />

    <div className={styles.totalDivider} />

<div className={styles.totalTitle}>
  Итого
</div>

<ReportRow
  label="Всего отработано часов"
  value={`${formatNumber(
    report.totalActualHours
  )} ч. (${formatMoney(
    report.mainSalary +
      report.extraSalary +
      report.overtimeSalary +
      report.nightSurcharge
  )})`}
  show={
    report.totalActualHours !==
    0
  }
/>
  </div>
              </section>

              {report.mentorShifts
                .length > 0 && (
                <section
                  className={
                    styles.card
                  }
                >
                  <h2
                    className={
                      styles.cardTitle
                    }
                  >
                    Наставничество
                  </h2>

                  <div
                    className={
                      styles.rows
                    }
                  >
                    <ReportRow
                      label="Смен наставником"
                      value={
                        report
                          .mentorShifts
                          .length
                      }
                    />

                    <ReportRow
                      label="Заработано"
                      value={formatMoney(
                        report.salaryFromMentoring
                      )}
                      show={
                        report.salaryFromMentoring !==
                        0
                      }
                    />
                  </div>

                  <div
                    className={
                      styles.mentorDates
                    }
                  >
                    <div
                      className={
                        styles.subTitle
                      }
                    >
                      Даты наставничества
                    </div>

                    {report.mentorShifts.map(
                      (
                        shift,
                        index
                      ) => (
                        <div
                          className={
                            styles.dateRow
                          }
                          key={`${shift.date.toString()}-${index}`}
                        >
                          <span>
                            {getDateLabel(
                              new Date(
                                shift.date
                              )
                            )}
                          </span>

                          <span>
                            {shift.type ===
                            "night"
                              ? "Ночная"
                              : "Дневная"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              {(report.salaryFromDiscipline !==
                0 ||
                report.experienceBonus !==
                  0 ||
                report.salaryWithoutErrors !==
                  0 ||
                report.premiumAmountTotal !==
                  0) && (
                <section
                  className={
                    styles.card
                  }
                >
                  <h2
                    className={
                      styles.cardTitle
                    }
                  >
                    Доплаты и стаж
                  </h2>

                  <div
                    className={
                      styles.rows
                    }
                  >
                    <ReportRow
                      label="Дисциплина"
                      value={formatMoney(
                        report.salaryFromDiscipline
                      )}
                      show={
                        report.salaryFromDiscipline !==
                        0
                      }
                    />

                    <ReportRow
                      label="Стаж"
                      value={formatMoney(
                        report.experienceBonus
                      )}
                      show={
                        report.experienceBonus !==
                        0
                      }
                    />

                    <ReportRow
                      label="Сборка без ошибок"
                      value={formatMoney(
                        report.salaryWithoutErrors
                      )}
                      show={
                        report.salaryWithoutErrors !==
                        0
                      }
                    />

                    <ReportRow
                      label="Дополнительные премии"
                      value={formatMoney(
                        report.premiumAmountTotal
                      )}
                      show={
                        report.premiumAmountTotal !==
                        0
                      }
                    />
                  </div>

                </section>
              )}

              {(report.errorsCount !==
                0 ||
                report.damageDeduction !==
                  0 ||
                report.manualPenaltyDeduction !==
                  0 ||
                report.absenceDeduction !==
                  0) && (
                <section
                  className={
                    styles.card
                  }
                >
                  <h2
                    className={
                      styles.cardTitle
                    }
                  >
                    Списания и ошибки
                  </h2>

                  <div
                    className={
                      styles.rows
                    }
                  >
                    {report.errorsCount !== 0 && (
  <div className={styles.row}>
    <span>
      <strong className={styles.errorCount}>
        {formatNumber(report.errorsCount)}
      </strong>{" "}
      ошибки
    </span>

    <strong>
      -{formatMoney(report.errorsDeduction)}
    </strong>
  </div>
)}

                    <ReportRow
                      label="Бой"
                      value={`-${formatMoney(
                        report.damageDeduction
                      )}`}
                      show={
                        report.damageDeduction !==
                        0
                      }
                    />

                    <ReportRow
                      label="Штрафы и ревизии"
                      value={`-${formatMoney(
                        report.manualPenaltyDeduction
                      )}`}
                      show={
                        report.manualPenaltyDeduction !==
                        0
                      }
                    />

                    <ReportRow
                      label="Прогулы"
                      value={`-${formatMoney(
                        report.absenceDeduction
                      )}`}
                      show={
                        report.absenceDeduction !==
                        0
                      }
                    />
                  </div>
                </section>
              )}

              {(report.totalAccruals !==
                0 ||
                report.totalDeductions !==
                  0 ||
                report.totalSalary !==
                  0 ||
                report.totalPaid !==
                  0 ||
                report.balance !==
                  0) && (
                <section
                  className={`${styles.card} ${styles.totalCard}`}
                >
                  <h2
                    className={
                      styles.cardTitle
                    }
                  >
                    Итог
                  </h2>

                  <div
                    className={
                      styles.rows
                    }
                  >
                    <ReportRow
                      label="Всего заработано"
                      value={formatMoney(
                        report.totalAccruals
                      )}
                      show={
                        report.totalAccruals !==
                        0
                      }
                    />

                    <ReportRow
                      label="Всего списано"
                      value={`-${formatMoney(
                        report.totalDeductions
                      )}`}
                      show={
                        report.totalDeductions !==
                        0
                      }
                    />

                    <div
                      className={
                        styles.totalRow
                      }
                    >
                      <span>
                        Итого заработано
                      </span>

                      <strong>
                        {formatMoney(
                          report.totalSalary
                        )}
                      </strong>
                    </div>

                    <ReportRow
                      label="Выплачено"
                      value={formatMoney(
                        report.totalPaid
                      )}
                      show={
                        report.totalPaid !==
                        0
                      }
                    />

                    <div
                      className={
                        styles.balanceRow
                      }
                    >
                      <span>
                        Разница
                      </span>

                      <strong>
                        {formatMoney(
                          report.balance
                        )}
                      </strong>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}