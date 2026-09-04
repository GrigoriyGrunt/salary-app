"use client";

import styles from "./DailyEarnings.module.css";

const days = [
  { day: "29", week: "Вт", amount: "5 482 ₽" },
  { day: "30", week: "Ср", amount: "4 967 ₽" },
  { day: "1", week: "Чт", amount: "5 210 ₽" },
  { day: "2", week: "Пт", amount: "4 835 ₽" },
  { day: "3", week: "Сб", amount: "5 184 ₽" },
  { day: "4", week: "Вс", amount: "—" },
  { day: "5", week: "Пн", amount: "—" },
];

export default function DailyEarnings() {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Заработок по дням</h2>

        <div className={styles.arrows}>
          <button className={styles.arrow}>‹</button>
          <button className={styles.arrow}>›</button>
        </div>
      </div>

      <div className={styles.days}>
        {days.map((item, index) => (
          <div
            key={index}
            className={styles.dayCard}
          >
            <div className={styles.day}>{item.day}</div>

            <div className={styles.week}>
              {item.week}
            </div>

            <div className={styles.amount}>
              {item.amount}
            </div>
          </div>
        ))}
      </div>

      <button className={styles.details}>
        Посмотреть день в деталях
        <span>›</span>
      </button>
    </section>
  );
}