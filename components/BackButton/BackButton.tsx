"use client";

import { useRouter } from "next/navigation";

import styles from "./BackButton.module.css";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      className={styles.button}
      onClick={() => router.back()}
      aria-label="Назад"
    >
      ←
    </button>
  );
}