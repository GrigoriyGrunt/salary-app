import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";

const defaultUsers: User[] = [
  {
    id: "1",
    lastName: "Грунт",
firstName: "Григорий",
middleName: "Андреевич",
    login: "gruntgrigoriy",
    accessCode: "4573",
    role: "admin",
    isSetupCompleted: false,
    warehouse: "",
    position: "",
    schedule: "",
    hireDate: "",
    firstShiftDate: "",
    firstShiftType: "day",
    secondShiftDate: "",
    secondShiftType: "day",
    scheduleChanges: [],
  },
];

type UsersStore = {
  users: User[];
  currentUserId: string | null;
  currentUser: User | null;

  addUser: (user: User) => void;
  setCurrentUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetUser: (id: string) => void;
  logout: () => void;
};

export const useUsersStore = create<UsersStore>()(
  persist(
    (set) => ({
      users: defaultUsers,
      currentUserId: null,
      currentUser: null,

    addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  setCurrentUser: (id) =>
  set((state) => {
    const user =
      state.users.find((user) => user.id === id) || null;

    return {
      currentUserId: id,
      currentUser: user,
    };
  }),
    updateUser: (id, data) =>
  set((state) => {
    const users = state.users.map((user) =>
      user.id === id
        ? { ...user, ...data }
        : user
    );

    return {
      users,
      currentUser:
        state.currentUserId === id
          ? users.find((user) => user.id === id) || null
          : state.currentUser,
    };
  }),
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter(
            (user) => user.id !== id
          ),
        })),

      resetUser: (id) =>
      set((state) => {
        const users = state.users.map((user) =>
          user.id === id
            ? {
                ...user,
                isSetupCompleted: false,
                warehouse: "",
                position: "",
                schedule: "",
                hireDate: "",
                firstShiftDate: "",
                firstShiftType: "day" as const,
                secondShiftDate: "",
                secondShiftType: "day" as const,
                scheduleChanges: [],
              }
            : user
        );

        return {
          users,
          currentUser:
            state.currentUserId === id
              ? users.find(
                  (user) => user.id === id
                ) || null
              : state.currentUser,
        };
      }),
      logout: () =>
  set({
    currentUserId: null,
    currentUser: null,
  }),
    }),
    {
      name: "users-storage",
      skipHydration: true,
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<UsersStore>;
        const users = (persisted.users ?? currentState.users).map((user) => ({
          ...user,
          scheduleChanges: user.scheduleChanges.map((change) => ({
            ...change,
            changeDate: new Date(change.changeDate),
            firstShiftDate: new Date(change.firstShiftDate),
            secondShiftDate: new Date(change.secondShiftDate),
          })),
        }));
        const currentUserId = persisted.currentUserId ?? null;

        return {
          ...currentState,
          ...persisted,
          users,
          currentUserId,
          currentUser: currentUserId
            ? users.find((user) => user.id === currentUserId) ?? null
            : null,
        };
      },
    }
  )
);
