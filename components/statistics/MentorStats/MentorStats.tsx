"use client";

import styles from "./MentorStats.module.css";
import { useScheduleStore } from "@/store/scheduleStore";

type MentorStatsProps = {
  selectedDate: Date;
};

export default function MentorStats({
  selectedDate,
}: MentorStatsProps) {
  const shifts = useScheduleStore(
    (state) => state.shifts
  );

  const mentorShifts = shifts
    .filter((shift) => {
      const date = new Date(shift.date);

      return (
        shift.mentor === true &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    })
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Наставник</h2>

      <div className={styles.column}>
        <div className={styles.card}>
          <div className={styles.label}>
            Был наставником
          </div>

          <div className={styles.value}>
            {mentorShifts.length}{" "}
            {mentorShifts.length === 1
              ? "смену"
              : mentorShifts.length >= 2 &&
                mentorShifts.length <= 4
              ? "смены"
              : "смен"}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.label}>
            Дни наставничества
          </div>

          <div className={styles.days}>
            {mentorShifts.map((shift) => {
              const date = new Date(shift.date);

              return (
                <div
                  key={date.toISOString()}
                  className={styles.dayRow}
                >
                  <span>
                    {date.toLocaleDateString(
                      "ru-RU"
                    )}
                  </span>

                  <span>
                    {shift.type === "night"
                      ? "Ночь"
                      : "День"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}