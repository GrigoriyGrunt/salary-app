import styles from "./CurrentSalary.module.css";

type Props = {
  total: number;
  paid: number;
  isWatchEmployee?: boolean;
};

export default function CurrentSalary({
  total,
  paid,
  isWatchEmployee,
}: Props) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
  {isWatchEmployee
    ? "Расчет за текущий период вахты"
    : "Расчет за текущий месяц"}
</h2>

      <div className={styles.content}>
        <div className={styles.block}>
          <div className={styles.label}>Общая заработанная сумма</div>
          <div className={styles.value}>
  {total.toLocaleString("ru-RU")} ₽
</div>
        </div>

        <div className={styles.divider} />

        <div className={styles.block}>
          <div className={styles.label}>Выплачено</div>
          <div className={styles.value}>
  {paid.toLocaleString("ru-RU")} ₽
</div>
        </div>
      </div>
    </section>
  );
}