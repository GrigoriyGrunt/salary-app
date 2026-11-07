"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import styles from "./BottomSheet.module.css";

export type BottomSheetOption = {
  label: string;
  disabled?: boolean;
  description?: string;
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
  const [activeDescription, setActiveDescription] = useState<string | null>(null);

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
        <div key={option.label} className={styles.optionRow}>
          <button
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

          {option.description && (
            <div className={styles.infoWrapper}>
              <button
                type="button"
                className={styles.infoIcon}
                aria-label="Описание"
                aria-expanded={activeDescription === option.label}
                onClick={() =>
                  setActiveDescription(
                    activeDescription === option.label
                      ? null
                      : option.label
                  )
                }
              >
                ?
              </button>

              {activeDescription === option.label && (
                <div className={styles.tooltip}>
                  {option.description}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </>
)}
      </div>
    </>,
    document.body
  );
}