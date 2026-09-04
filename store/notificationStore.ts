import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserNotificationData = {
  dismissedNotifications: string[];
};

type NotificationStore = {
  currentUserId: string | null;

  dismissedNotifications: string[];

  notificationsByUser: Record<
    string,
    UserNotificationData
  >;

  setCurrentUser: (
    userId: string | null
  ) => void;

  dismissNotification: (
    notificationId: string
  ) => void;

  isNotificationDismissed: (
    notificationId: string
  ) => boolean;

  clear: () => void;

  deleteUserNotifications: (
    userId: string
  ) => void;
};

const createEmptyUserNotifications =
  (): UserNotificationData => ({
    dismissedNotifications: [],
  });

const getUserNotifications = (
  notificationsByUser: Record<
    string,
    UserNotificationData
  >,
  userId: string
): UserNotificationData => {
  return (
    notificationsByUser[userId] ??
    createEmptyUserNotifications()
  );
};

export const useNotificationStore =
  create<NotificationStore>()(
    persist(
      (set, get) => ({
        currentUserId: null,

        dismissedNotifications: [],

        notificationsByUser: {},

        setCurrentUser: (userId) =>
          set((state) => {
            if (!userId) {
              return {
                currentUserId: null,
                dismissedNotifications: [],
              };
            }

            const userNotifications =
              getUserNotifications(
                state.notificationsByUser,
                userId
              );

            return {
              currentUserId: userId,

              dismissedNotifications:
                userNotifications.dismissedNotifications,
            };
          }),

        dismissNotification: (
          notificationId
        ) => {
          set((state) => {
            if (
              state.dismissedNotifications.includes(
                notificationId
              )
            ) {
              return {};
            }

            const dismissedNotifications = [
              ...state.dismissedNotifications,
              notificationId,
            ];

            if (!state.currentUserId) {
              return {
                dismissedNotifications,
              };
            }

            return {
              dismissedNotifications,

              notificationsByUser: {
                ...state.notificationsByUser,

                [state.currentUserId]: {
                  dismissedNotifications,
                },
              },
            };
          });
        },

        isNotificationDismissed: (
          notificationId
        ) =>
          get().dismissedNotifications.includes(
            notificationId
          ),

        clear: () =>
          set((state) => {
            if (!state.currentUserId) {
              return {
                dismissedNotifications: [],
              };
            }

            return {
              dismissedNotifications: [],

              notificationsByUser: {
                ...state.notificationsByUser,

                [state.currentUserId]:
                  createEmptyUserNotifications(),
              },
            };
          }),

        deleteUserNotifications: (
          userId
        ) =>
          set((state) => {
            const notificationsByUser = {
              ...state.notificationsByUser,
            };

            delete notificationsByUser[userId];

            if (
              state.currentUserId === userId
            ) {
              return {
                currentUserId: null,

                dismissedNotifications: [],

                notificationsByUser,
              };
            }

            return {
              notificationsByUser,
            };
          }),
      }),

      {
        name: "salary-app-notifications",

        skipHydration: true,

        merge: (
          persistedState,
          currentState
        ) => {
          const persisted =
            persistedState as Partial<NotificationStore>;

          return {
            ...currentState,
            ...persisted,

            currentUserId: null,

            dismissedNotifications: [],
          };
        },
      }
    )
  );