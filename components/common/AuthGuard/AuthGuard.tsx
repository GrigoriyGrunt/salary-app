"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useFinanceStore } from "@/store/financeStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useUsersStore } from "@/store/usersStore";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const currentUser = useUsersStore(
    (state) => state.currentUser
  );
  const logout = useUsersStore((state) => state.logout);
  const resetUser = useUsersStore(
    (state) => state.resetUser
  );
  const clearSchedule = useScheduleStore(
    (state) => state.clear
  );
  const clearFinance = useFinanceStore(
    (state) => state.clear
  );

  const [checkedPath, setCheckedPath] =
    useState<string | null>(null);

  const isPublicRoute =
    pathname === "/splash" || pathname === "/login";

  useEffect(() => {
    if (isPublicRoute) return;

    const allowPage = () => {
      window.setTimeout(() => {
        setCheckedPath(pathname);
      }, 0);
    };

    const clearSession = () => {
      localStorage.removeItem("currentUserId");
      localStorage.removeItem("rememberLogin");
      localStorage.removeItem("loginExpiresAt");
      logout();
    };

    if (!sessionStorage.getItem("splashShown")) {
      router.replace("/splash");
      return;
    }

    const userId = localStorage.getItem("currentUserId");

    if (!userId || !currentUser) {
      router.replace("/splash");
      return;
    }

    const setupInProgress = !currentUser.isSetupCompleted;
    const setupRoutes = [
      "/onboarding",
      "/hire-date",
      "/next-shift",
    ];
    const expireSession = async () => {
  if (setupInProgress) {
    try {
      await fetch("/api/users/reset", {
        method: "POST",
      });
    } catch (error) {
      console.error(
        "Failed to reset unfinished setup:",
        error
      );
    }

    resetUser(currentUser.id);
    clearSchedule();
    clearFinance();
  }

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error(
      "Failed to logout:",
      error
    );
  }

  clearSession();
  router.replace("/splash");
};

    if (
      setupInProgress &&
      !setupRoutes.includes(pathname)
    ) {
      router.replace("/onboarding");
      return;
    }

    const rememberLogin =
      localStorage.getItem("rememberLogin");
    const loginExpiresAt = Number(
      localStorage.getItem("loginExpiresAt")
    );
    const needsTemporarySession =
      setupInProgress || rememberLogin !== "true";

    if (!needsTemporarySession) {
      allowPage();
      return;
    }

    if (!loginExpiresAt || Date.now() >= loginExpiresAt) {
  void expireSession();
  return;
}

    allowPage();

    const timeout = window.setTimeout(() => {
  void expireSession();
}, loginExpiresAt - Date.now());

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    clearFinance,
    clearSchedule,
    currentUser,
    isPublicRoute,
    logout,
    pathname,
    resetUser,
    router,
  ]);

  if (!isPublicRoute && checkedPath !== pathname) {
    return null;
  }

  return <>{children}</>;
}
