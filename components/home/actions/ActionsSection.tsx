import styles from "./ActionsSection.module.css";
import ActionCard from "./ActionCard";
import { useFinanceStore } from "@/store/financeStore";

export default function ActionsSection() {
  const financeDeductions = useFinanceStore(
    (state) => state.deductions
  );

  const currentDate = new Date();

  const currentMonthKey = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const totalErrors = financeDeductions
    .filter(
      (deduction) =>
        deduction.monthKey === currentMonthKey &&
        deduction.type === "Ошибка"
    )
    .reduce(
      (total, deduction) =>
        total + Number(deduction.amount || 0),
      0
    );

  const errorsText =
    totalErrors === 1
      ? "1 ошибка"
      : totalErrors > 1
        ? `${totalErrors} ошибок`
        : "0 ошибок";

  return (
    <section className={styles.section}>
      <ActionCard
  icon="/images/icons/salary.png"
  title="Расчёт зарплаты"
  subtitle="Посмотреть"
  href="/money"
/>

      <ActionCard
  icon="/images/icons/errors.png"
  title="Ошибки и штрафы"
  subtitle={errorsText}
  href="/money"
/>
    </section>
  );
}