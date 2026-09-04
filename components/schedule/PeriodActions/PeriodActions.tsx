import styles from "./PeriodActions.module.css";
type PeriodActionsProps = {
  onVacationClick: () => void;
  onSickClick: () => void;
};

export default function PeriodActions({
  onVacationClick,
  onSickClick,
}: PeriodActionsProps) {
  return (
    <div className={styles.periodActions}>
      <button
  type="button"
  className={styles.periodAction}
  onClick={onVacationClick}
>
        <span className={styles.plus}>+</span>
        Отпуск
      </button>

      <button
  type="button"
  className={styles.periodAction}
  onClick={onSickClick}
>
        <span className={styles.plus}>+</span>
        Больничный
      </button>
    </div>
  );
}