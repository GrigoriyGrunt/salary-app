"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import styles from "./BottomSheet.module.css";

export type BottomSheetOption = {
  label: string;
  disabled?: boolean;
};

type BottomSheetProps = {
  isOpen: boolean;
  title?: string;
  options?: BottomSheetOption[];
  onSelect?: (value: string) => void;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
};

export default function BottomSheet({
  isOpen,
  title,
  options,
  onSelect,
  onClose,
    children,
  className,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);

  return () => {
    setMounted(false);
  };
}, []);
  if (!isOpen || typeof document === "undefined") {
  return null;
}

return createPortal(
  <>
      <div
        className={styles.overlay}
        onClick={onClose}
      />

      <div className={`${styles.sheet} ${className ? className : ""}`}>
        <div className={styles.handle} />

        {children ? (
  children
) : (
  <>
    <h2 className={styles.title}>
      {title}
    </h2>

    <div className={styles.list}>
      {options?.map((option) => (
        <button
          key={option.label}
          type="button"
          disabled={option.disabled}
          className={`${styles.option} ${
            option.disabled ? styles.disabled : ""
          }`}
          onClick={() => {
            if (!option.disabled) {
              onSelect?.(option.label);
            }
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  </>
)}
      </div>
    </>,
    document.body
  );
}