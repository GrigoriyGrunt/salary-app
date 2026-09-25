"use client";

import {
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import styles from "./GlobalLoading.module.css";

type GlobalLoadingProps = {
  forceVisible?: boolean;
  large?: boolean;
  splash?: boolean;
};

export default function GlobalLoading({
  forceVisible = false,
  large = false,
  splash = false,
}: GlobalLoadingProps) {
  const pathname = usePathname();

  const [navigationLoading, setNavigationLoading] =
    useState(false);

  const [activeFetches, setActiveFetches] =
    useState(0);

  useEffect(() => {
    const originalFetch = window.fetch;

    const originalPushState =
      window.history.pushState;

    const originalReplaceState =
      window.history.replaceState;

    const handleFetch = async (
      ...args: Parameters<typeof window.fetch>
    ) => {
      setActiveFetches(
        (count) => count + 1
      );

      try {
        return await originalFetch(
          ...args
        );
      } finally {
        setActiveFetches(
          (count) =>
            Math.max(0, count - 1)
        );
      }
    };

    const handlePushState =
  function (
    this: History,
    ...args: Parameters<History["pushState"]>
  ) {
    window.setTimeout(() => {
      setNavigationLoading(true);
    }, 0);

    return originalPushState.apply(
      this,
      args
    );
  };

    const handleReplaceState =
  function (
    this: History,
    ...args: Parameters<History["replaceState"]>
  ) {
    window.setTimeout(() => {
      setNavigationLoading(true);
    }, 0);

    return originalReplaceState.apply(
      this,
      args
    );
  };

    const handlePopState = () => {
      setNavigationLoading(true);
    };

    const handleBackButtonClick = (
      event: MouseEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      if (
        target?.closest(
          'button[aria-label="Назад"]'
        )
      ) {
        setNavigationLoading(true);
      }
    };

    window.fetch = handleFetch;

    window.history.pushState =
      handlePushState;

    window.history.replaceState =
      handleReplaceState;

    window.addEventListener(
      "popstate",
      handlePopState
    );

    document.addEventListener(
      "click",
      handleBackButtonClick,
      true
    );

    return () => {
      window.fetch = originalFetch;

      window.history.pushState =
        originalPushState;

      window.history.replaceState =
        originalReplaceState;

      window.removeEventListener(
        "popstate",
        handlePopState
      );

      document.removeEventListener(
        "click",
        handleBackButtonClick,
        true
      );
    };
  }, []);

  useEffect(() => {
    setNavigationLoading(false);
  }, [pathname]);

  const isLoading =
  forceVisible ||
  navigationLoading ||
  activeFetches > 0;

  if (!isLoading) {
    return null;
  }

  return (
    <div
  className={styles.overlay}
  aria-label="Загрузка"
  role="status"
  aria-live="polite"
>
  <div
  className={`${styles.spinner} ${
    large ? styles.large : ""
  } ${splash ? styles.splash : ""}`}
/>
</div>
  );
}