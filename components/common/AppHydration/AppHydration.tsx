"use client";

import { useEffect, useState } from "react";

import { useUsersStore } from "@/store/usersStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useFinanceStore } from "@/store/financeStore";
import { useNotificationStore } from "@/store/notificationStore";

export default function AppHydration({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
  useUsersStore.persist.rehydrate(),
  useScheduleStore.persist.rehydrate(),
  useFinanceStore.persist.rehydrate(),
]).finally(() => {
  const currentUserId =
    useUsersStore.getState().currentUserId;

  useScheduleStore
    .getState()
    .setCurrentUser(currentUserId);
useFinanceStore
  .getState()
  .setCurrentUser(currentUserId);
useNotificationStore
  .getState()
  .setCurrentUser(currentUserId);  
  if (!cancelled) setIsHydrated(true);
});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
