import styles from "./CurrentSalary.module.css";

type Props = {
  total: number;
  paid: number;
};

export default function CurrentSalary({
  total,
  paid,
}: Props) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Расчет за текущий месяц</h2>

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