import styles from "./ProductionDetailsModal.module.css";

type ProductionItem = {
  date: string;
  value: number;
};

type ProductionDetailsModalProps = {
  title: string;
  items: ProductionItem[];
  total: number;
  unit: string;
  onClose: () => void;
};

export default function ProductionDetailsModal({
  title,
  items,
  total,
  unit,
  onClose,
}: ProductionDetailsModalProps) {
  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
        >
          ×
        </button>

        <h2 className={styles.title}>
          {title}
        </h2>

        <div className={styles.list}>
          {items.map((item) => (
            <div
              key={item.date}
              className={styles.row}
            >
              <span>{item.date}</span>

              <span>
                {item.value} {unit}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.total}>
          <span>Итого</span>

          <span>
            {total} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}