"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet/BottomSheet";
import DeductionEditor from "../DeductionEditor/DeductionEditor";
import styles from "./Deductions.module.css";
import { useFinanceStore } from "@/store/financeStore";

const deductionTypes = [
  "Ошибка",
  "Бой",
  "Штраф",
  "Ревизия",
];

type Props = {
  selectedDate: Date;
};

export default function Deductions({
  selectedDate,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
const [selectedType, setSelectedType] = useState("");
const [typeListOpen, setTypeListOpen] = useState(false);
const currentMonthKey = `${selectedDate.getFullYear()}-${String(
  selectedDate.getMonth() + 1
).padStart(2, "0")}`;
    const addDeduction = useFinanceStore(
    (state) => state.addDeduction
  );

  const handleClose = () => {
  setSheetOpen(false);
  setSelectedType("");
  setTypeListOpen(false);
};

  return (
    <>
            <div className={styles.card}>
        <button
          className={styles.addButton}
          onClick={() => setSheetOpen(true)}
        >
          + Добавить списание
        </button>
      </div>

      <BottomSheet
        isOpen={sheetOpen}
        title="Добавить списание"
        onClose={handleClose}
      >
        <div className={styles.editor}>
          <div className={styles.typeSelector}>
  <div className={styles.label}>
    Тип списания
  </div>

  <button
    type="button"
    className={styles.selectButton}
    onClick={() =>
      setTypeListOpen((previous) => !previous)
    }
  >
    <span>
      {selectedType || "Выберите списание"}
    </span>

    <span
      className={`${styles.arrow} ${
        typeListOpen ? styles.arrowOpen : ""
      }`}
    >
      ▾
    </span>
  </button>

  {typeListOpen && (
    <div className={styles.options}>
      {deductionTypes.map((type) => (
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
            <DeductionEditor
              title={selectedType}
              onSave={(amount) => {
                addDeduction({
  type: selectedType,
  amount,
  monthKey: currentMonthKey,
});

                handleClose();
              }}
            />
          )}
        </div>
      </BottomSheet>
    </>
  );
}