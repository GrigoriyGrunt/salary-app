"use client";

import {
  useEffect,
  useState,
} from "react";
import BottomSheet from "@/components/BottomSheet/BottomSheet";
import PaymentEditor from "../PaymentEditor/PaymentEditor";
import styles from "./Payments.module.css";
import { useFinanceStore } from "@/store/financeStore";

const paymentTypes = [
  "Аванс",
  "Зарплата",
  "Отпускные",
  "Больничный",
  "Премия",
];
type PaymentsProps = {
  selectedDate: Date;
  autoOpenType?: string | null;
  autoOpenDate?: string | null;
};
export default function Payments({
  selectedDate,
  autoOpenType,
  autoOpenDate,
}: PaymentsProps) {
  const payments = useFinanceStore((state) => state.payments);
  const savePayment = useFinanceStore((state) => state.savePayment);
    const removePayment = useFinanceStore(
    (state) => state.removePayment
  );

  const monthKey =
    `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}`;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [typeListOpen, setTypeListOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] =
    useState<number | null>(null);
  useEffect(() => {
    if (
      autoOpenType !== "Аванс" &&
      autoOpenType !== "Зарплата"
    ) {
      return;
    }

    setSelectedType(autoOpenType);
    setTypeListOpen(false);
    setSheetOpen(true);
  }, [
    autoOpenType,
    autoOpenDate,
  ]);
    const selectedPayment =
    selectedType === "Аванс" ||
    selectedType === "Зарплата"
      ? payments.find(
          (payment) =>
            payment.type === selectedType &&
            payment.monthKey === monthKey
        )
      : undefined;

  const handleClose = () => {
    setSheetOpen(false);
    setSelectedType("");
    setTypeListOpen(false);
  };
  const monthPayments = payments.filter(
    (payment) => payment.monthKey === monthKey
  );
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
        Фактические поступления
      </h2>

      <div className={styles.list}>
                {monthPayments.map((payment) => (
          <div
            key={payment.id}
            className={styles.row}
            onClick={() => {
              setSelectedType(payment.type);
              setSheetOpen(true);
            }}
          >
            <span className={styles.date}>
              {payment.date}
            </span>

            <span className={styles.type}>
              {payment.type}
            </span>

            <div className={styles.actions}>
              <span className={styles.amount}>
                {payment.amount}
              </span>

              <button
                type="button"
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentToDelete(payment.id);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className={styles.addButton}
        onClick={() => {
          setSelectedType("");
          setTypeListOpen(false);
          setSheetOpen(true);
        }}
      >
        + Добавить поступление
      </button>

      <BottomSheet
        isOpen={sheetOpen}
        title="Добавить поступление"
        onClose={handleClose}
      >
        <div className={styles.editor}>
          <div className={styles.typeSelector}>
            <div className={styles.label}>
              Тип поступления
            </div>

            <button
              type="button"
              className={styles.selectButton}
              onClick={() =>
                setTypeListOpen((previous) => !previous)
              }
            >
              <span>
                {selectedType ||
                  "Выберите поступление"}
              </span>

              <span
                className={`${styles.arrow} ${
                  typeListOpen
                    ? styles.arrowOpen
                    : ""
                }`}
              >
                ▾
              </span>
            </button>

            {typeListOpen && (
              <div className={styles.options}>
                {paymentTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`${styles.option} ${
                      selectedType === type
                        ? styles.selectedOption
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedType(type);
                      setTypeListOpen(false);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedType && (
            <PaymentEditor
              key={selectedType}
              title={selectedType}
              initialDate={
  selectedPayment?.date ??
  autoOpenDate ??
  ""
}
              initialAmount={
                selectedPayment
                  ? selectedPayment.amount.replace(
                      /[^\d]/g,
                      ""
                    )
                  : ""
              }
              onSave={(date, amount) => {
                const formattedAmount =
                  Number(amount).toLocaleString(
                    "ru-RU"
                  ) + " ₽";

                                if (
                  selectedType === "Аванс" ||
                  selectedType === "Зарплата"
                ) {
                  const index = payments.findIndex(
                    (payment) =>
                      payment.type === selectedType &&
                      payment.monthKey === monthKey
                  );

                  if (index !== -1) {
                    savePayment(
                      {
                        date,
                        type: selectedType,
                        amount: formattedAmount,
                        monthKey,
                      },
                      payments[index].id
                    );
                  } else {
                    savePayment({
                      date,
                      type: selectedType,
                      amount: formattedAmount,
                      monthKey,
                    });
                  }
                } else {
                  savePayment({
                    date,
                    type: selectedType,
                    amount: formattedAmount,
                    monthKey,
                  });
                }

                handleClose();
              }}
            />
          )}
        </div>
      </BottomSheet>

      {paymentToDelete !== null && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogTitle}>
              Удалить поступление?
            </div>

            <div className={styles.dialogButtons}>
              <button
                className={styles.cancelButton}
                onClick={() =>
                  setPaymentToDelete(null)
                }
              >
                Нет
              </button>

              <button
                className={styles.confirmButton}
                onClick={() => {
                  removePayment(paymentToDelete);

                  setPaymentToDelete(null);
                }}
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}