import { create } from "zustand";

type NotificationStore = {
  currentUserId: string | null;

  dismissedNotifications: string[];

  setCurrentUser: (
    userId: string | null
  ) => Promise<void>;

  dismissNotification: (
    notificationId: string
  ) => Promise<void>;

  isNotificationDismissed: (
    notificationId: string
  ) => boolean;

  clear: () => void;

  deleteUserNotifications: (
    userId: string
  ) => void;
};

export const useNotificationStore =
  create<NotificationStore>()((set, get) => ({
    currentUserId: null,

    dismissedNotifications: [],

    setCurrentUser: async (userId) => {
      if (!userId) {
        set({
          currentUserId: null,
          dismissedNotifications: [],
        });

        return;
      }

      set({
        currentUserId: userId,
        dismissedNotifications: [],
      });

      try {
        const response = await fetch(
          `/api/notifications?userId=${userId}`
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        if (
          get().currentUserId !== userId
        ) {
          return;
        }

        set({
          dismissedNotifications:
            data.dismissedNotifications ?? [],
        });
      } catch {
        console.error(
          "Не удалось загрузить закрытые уведомления"
        );
      }
    },

    dismissNotification: async (
      notificationId
    ) => {
      const userId = get().currentUserId;

      if (!userId) {
        return;
      }

      if (
        get().dismissedNotifications.includes(
          notificationId
        )
      ) {
        return;
      }

      try {
        const response = await fetch(
          "/api/notifications",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              userId,
              notificationId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error();
        }

        set((state) => ({
          dismissedNotifications: [
            ...state.dismissedNotifications,
            notificationId,
          ],
        }));
      } catch {
        console.error(
          "Не удалось закрыть уведомление"
        );
      }
    },

    isNotificationDismissed: (
      notificationId
    ) =>
      get().dismissedNotifications.includes(
        notificationId
      ),

    clear: () =>
      set({
        dismissedNotifications: [],
      }),

    deleteUserNotifications: (
      userId
    ) => {
      if (get().currentUserId === userId) {
        set({
          currentUserId: null,
          dismissedNotifications: [],
        });
      }
    },
  }));