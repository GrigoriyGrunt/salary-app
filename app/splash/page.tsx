"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import GlobalLoading from "@/components/GlobalLoading/GlobalLoading";
import { useUsersStore } from "@/store/usersStore";

import styles from "./page.module.css";

export default function SplashPage() {
  const router = useRouter();
  const currentUser = useUsersStore(
    (state) => state.currentUser
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    sessionStorage.setItem("splashShown", "true");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          setTimeout(() => {
  const userId =
    localStorage.getItem("currentUserId");

  const rememberLogin =
    localStorage.getItem("rememberLogin");

  const loginExpiresAt =
    localStorage.getItem("loginExpiresAt");

  const destination = currentUser?.isSetupCompleted
    ? "/"
    : "/onboarding";

  if (!userId) {
    router.push("/login");
    return;
  }

  if (
    loginExpiresAt &&
    Date.now() >= Number(loginExpiresAt)
  ) {
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("rememberLogin");
    localStorage.removeItem("loginExpiresAt");

    router.push("/login");
    return;
  }

  if (rememberLogin === "true") {
    router.push(destination);
    return;
  }

  if (loginExpiresAt) {
    router.push(destination);
    return;
  }

  localStorage.removeItem("currentUserId");
  localStorage.removeItem("rememberLogin");
  localStorage.removeItem("loginExpiresAt");

  router.push("/login");
}, 200);

          return 100;
        }

        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
    }, [router]);

  return (
    <main className={styles.page}>
      <div />

      <div className={styles.center}>
        <Image
  src="/images/logo-icon-app-2.png"
  alt="Калькулятор ЗП"
  width={130}
  height={130}
  priority
/>

        <p className={styles.subtitle}>
          Твой личный калькулятор
          <br />
          зарплаты
        </p>
      </div>

      <div className={styles.bottom}>
        <GlobalLoading
  forceVisible
  large
  splash
/>

        <div className={styles.footer}>
          <div className={styles.title}>Калькулятор ЗП</div>
          <div className={styles.version}>Версия 1.0</div>
        </div>
      </div>
    </main>
  );
}
