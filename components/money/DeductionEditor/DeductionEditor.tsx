"use client";

import { useEffect, useState } from "react";
import styles from "./DeductionEditor.module.css";

type Props = {
  title: string;
  onSave: (amount: string) => void;
};

export default function DeductionEditor({
  title,
  onSave,
}: Props) {
  const [amount, setAmount] = useState("");
useEffect(() => {
  setAmount("");
}, [title]);
  return (
  <div className={styles.wrapper}>
    <h2 className={styles.title}>{title}</h2>

    <input
  className={styles.input}
  type="number"
  min="1"
  placeholder={
    title === "Ошибка"
      ? "Введите количество ошибок"
      : "Введите сумму"
  }
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
/>

    <button
      className={styles.button}
      onClick={() => onSave(amount)}
      disabled={!amount}
    >
      Добавить
    </button>
  </div>
);
}