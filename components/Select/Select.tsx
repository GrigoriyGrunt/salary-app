"use client";

import { useState } from "react";

import BottomSheet, {
  BottomSheetOption,
} from "../BottomSheet/BottomSheet";

import styles from "./Select.module.css";

type SelectProps = {
  label: string;
  placeholder: string;
  options: BottomSheetOption[];

  value: string;
  onChange: (value: string) => void;
};

export default function Select({
  label,
  placeholder,
  options,
  value,
  onChange,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  function handleSelect(option: string) {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <>
      <div className={styles.wrapper}>
        <label className={styles.label}>
          {label}
        </label>

        <button
          type="button"
          className={styles.select}
          onClick={() => setIsOpen(true)}
        >
          <span
            className={
              value
                ? styles.value
                : styles.placeholder
            }
          >
            {value || placeholder}
          </span>

          <span className={styles.arrow}>
            ▼
          </span>
        </button>
      </div>

      <BottomSheet
        isOpen={isOpen}
        title={label}
        options={options}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
}
