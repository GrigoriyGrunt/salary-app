import styles from "./InfoRow.module.css";

type InfoRowProps = {
  label: string;
  value: string | number;
};

export default function InfoRow({
  label,
  value,
}: InfoRowProps) {
  return (
    <div className={styles.section}>
      <div className={styles.label}>
        {label}
      </div>

      <div className={styles.value}>
        {value}
      </div>
    </div>
  );
}