"use client";

import { useRef, useState } from "react";
import styles from "./PaymentEditor.module.css";

type Props = {
  title: string;
  initialDate?: string;
  initialAmount?: string;
  onSave: (date: string, amount: string) => void;
};

export default function PaymentEditor({
  title,
  initialDate = "",
  initialAmount = "",
  onSave,
}: Props) {
  const [date, setDate] = useState(initialDate);
  const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  let result = "";

  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) {
      result += ".";
    }

    result += digits[i];
  }

  return result;
};
  const [amount, setAmount] = useState(initialAmount);
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.field}>
        <label>Дата</label>

        <div className={styles.inputWrapper}>
  <input
    ref={dateInputRef}
    type="text"
    inputMode="numeric"
    placeholder="ДД.ММ.ГГГГ"
    maxLength={10}
    value={date}
    onChange={(e) => {
      setDate(formatDateInput(e.target.value));
    }}
  />

  {date && (
    <button
      type="button"
      className={styles.clearButton}
      onClick={() => {
        setDate("");

        requestAnimationFrame(() => {
          dateInputRef.current?.focus();
        });
      }}
    >
      ✕
    </button>
  )}
</div>
      </div>

      <div className={styles.field}>
        <label>Сумма</label>

        <div className={styles.inputWrapper}>
  <input
    type="text"
    inputMode="numeric"
    placeholder="0"
    value={amount}
    onChange={(e) => {
      const digits = e.target.value.replace(/\D/g, "");
      setAmount(digits);
    }}
  />

  {amount && (
    <button
      type="button"
      className={styles.clearButton}
      onClick={() => setAmount("")}
    >
      ✕
    </button>
  )}
</div>
      </div>

      <button
        className={styles.button}
        onClick={() => onSave(date, amount)}
      >
        Сохранить
      </button>
    </div>
  );
}
