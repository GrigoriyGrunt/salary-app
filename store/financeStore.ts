import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Payment = {
  id: number;
  date: string;
  type: string;
  amount: string;
  monthKey: string;
};

export type Deduction = {
  id: number;
  type: string;
  amount: string;
  monthKey: string;
};

export type Premium = {
  id: number;
  amount: string;
  comment: string;
  monthKey: string;
};

type UserFinanceData = {
  payments: Payment[];
  totalSalary: number;

  goal: number;
  goalMonthKey: string | null;

  deductions: Deduction[];
  premiums: Premium[];
};

type FinanceState = {
  currentUserId: string | null;

  payments: Payment[];
  totalSalary: number;

  goal: number;
  goalMonthKey: string | null;

  deductions: Deduction[];
  premiums: Premium[];

  financeByUser: Record<string, UserFinanceData>;

  setCurrentUser: (userId: string | null) => void;

  setTotalSalary: (totalSalary: number) => void;

  setGoal: (goal: number) => void;
  syncGoalMonth: () => void;

  savePayment: (
    payment: Omit<Payment, "id">,
    id?: number
  ) => void;

  removePayment: (id: number) => void;

  addDeduction: (
    deduction: Omit<Deduction, "id">
  ) => void;

  removeDeduction: (id: number) => void;

  addPremium: (
    premium: Omit<Premium, "id">
  ) => void;

  removePremium: (id: number) => void;

  decrementDeduction: (id: number) => void;

  clear: () => void;

  deleteUserFinance: (userId: string) => void;
};

const getCurrentMonthKey = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
};

const createEmptyUserFinance =
  (): UserFinanceData => ({
    payments: [],
    totalSalary: 0,

    goal: 0,
    goalMonthKey: null,

    deductions: [],
    premiums: [],
  });

const getUserFinance = (
  financeByUser: Record<string, UserFinanceData>,
  userId: string
): UserFinanceData => {
  return (
    financeByUser[userId] ??
    createEmptyUserFinance()
  );
};

export const useFinanceStore =
  create<FinanceState>()(
    persist(
      (set) => ({
        currentUserId: null,

        payments: [],
        totalSalary: 0,

        goal: 0,
        goalMonthKey: null,

        deductions: [],
        premiums: [],

        financeByUser: {},

        setCurrentUser: (userId) =>
          set((state) => {
            if (!userId) {
              return {
                currentUserId: null,

                payments: [],
                totalSalary: 0,

                goal: 0,
                goalMonthKey: null,

                deductions: [],
                premiums: [],
              };
            }

            const userFinance =
              getUserFinance(
                state.financeByUser,
                userId
              );

            return {
              currentUserId: userId,

              payments: userFinance.payments,
              totalSalary:
                userFinance.totalSalary,

              goal: userFinance.goal,
              goalMonthKey:
                userFinance.goalMonthKey,

              deductions:
                userFinance.deductions,

              premiums:
                userFinance.premiums,
            };
          }),

        setTotalSalary: (totalSalary) =>
          set((state) => {
            if (!state.currentUserId) {
              return { totalSalary };
            }

            const userFinance = {
              ...getUserFinance(
                state.financeByUser,
                state.currentUserId
              ),

              totalSalary,
            };

            return {
              totalSalary,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]:
                  userFinance,
              },
            };
          }),

        setGoal: (goal) =>
          set((state) => {
            const goalMonthKey =
              getCurrentMonthKey();

            if (!state.currentUserId) {
              return {
                goal,
                goalMonthKey,
              };
            }

            const userFinance = {
              ...getUserFinance(
                state.financeByUser,
                state.currentUserId
              ),

              goal,
              goalMonthKey,
            };

            return {
              goal,
              goalMonthKey,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]:
                  userFinance,
              },
            };
          }),

        syncGoalMonth: () =>
          set((state) => {
            const currentMonthKey =
              getCurrentMonthKey();

            if (
              state.goalMonthKey ===
              currentMonthKey
            ) {
              return {};
            }

            if (!state.currentUserId) {
              return {
                goal: 0,
                goalMonthKey:
                  currentMonthKey,
              };
            }

            const userFinance = {
              ...getUserFinance(
                state.financeByUser,
                state.currentUserId
              ),

              goal: 0,
              goalMonthKey:
                currentMonthKey,
            };

            return {
              goal: 0,
              goalMonthKey:
                currentMonthKey,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]:
                  userFinance,
              },
            };
          }),

        savePayment: (payment, id) =>
          set((state) => {
            const payments =
              id !== undefined
                ? state.payments.map(
                    (item) =>
                      item.id === id
                        ? {
                            ...payment,
                            id,
                          }
                        : item
                  )
                : [
                    ...state.payments,
                    {
                      ...payment,
                      id: Date.now(),
                    },
                  ];

            if (!state.currentUserId) {
              return { payments };
            }

            const userFinance = {
              ...getUserFinance(
                state.financeByUser,
                state.currentUserId
              ),

              payments,
            };

            return {
              payments,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]:
                  userFinance,
              },
            };
          }),

        removePayment: (id) =>
          set((state) => {
            const payments =
              state.payments.filter(
                (payment) =>
                  payment.id !== id
              );

            if (!state.currentUserId) {
              return { payments };
            }

            return {
              payments,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]: {
                  ...getUserFinance(
                    state.financeByUser,
                    state.currentUserId
                  ),

                  payments,
                },
              },
            };
          }),

        addDeduction: (deduction) =>
          set((state) => {
            const deductions = [
              ...state.deductions,

              {
                ...deduction,
                id: Date.now(),
              },
            ];

            if (!state.currentUserId) {
              return { deductions };
            }

            return {
              deductions,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]: {
                  ...getUserFinance(
                    state.financeByUser,
                    state.currentUserId
                  ),

                  deductions,
                },
              },
            };
          }),

        removeDeduction: (id) =>
          set((state) => {
            const deductions =
              state.deductions.filter(
                (deduction) =>
                  deduction.id !== id
              );

            if (!state.currentUserId) {
              return { deductions };
            }

            return {
              deductions,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]: {
                  ...getUserFinance(
                    state.financeByUser,
                    state.currentUserId
                  ),

                  deductions,
                },
              },
            };
          }),

        addPremium: (premium) =>
          set((state) => {
            const premiums = [
              ...state.premiums,

              {
                ...premium,
                id: Date.now(),
              },
            ];

            if (!state.currentUserId) {
              return { premiums };
            }

            return {
              premiums,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]: {
                  ...getUserFinance(
                    state.financeByUser,
                    state.currentUserId
                  ),

                  premiums,
                },
              },
            };
          }),

        removePremium: (id) =>
          set((state) => {
            const premiums =
              state.premiums.filter(
                (premium) =>
                  premium.id !== id
              );

            if (!state.currentUserId) {
              return { premiums };
            }

            return {
              premiums,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]: {
                  ...getUserFinance(
                    state.financeByUser,
                    state.currentUserId
                  ),

                  premiums,
                },
              },
            };
          }),

        decrementDeduction: (id) =>
          set((state) => {
            const deductions =
              state.deductions
                .map((deduction) => {
                  if (
                    deduction.id !== id
                  ) {
                    return deduction;
                  }

                  const amount = Number(
                    deduction.amount
                  );

                  if (amount <= 1) {
                    return null;
                  }

                  return {
                    ...deduction,

                    amount: String(
                      amount - 1
                    ),
                  };
                })
                .filter(
                  (
                    deduction
                  ): deduction is Deduction =>
                    deduction !== null
                );

            if (!state.currentUserId) {
              return { deductions };
            }

            return {
              deductions,

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]: {
                  ...getUserFinance(
                    state.financeByUser,
                    state.currentUserId
                  ),

                  deductions,
                },
              },
            };
          }),

        clear: () =>
          set((state) => {
            if (!state.currentUserId) {
              return {
                payments: [],
                totalSalary: 0,

                goal: 0,
                goalMonthKey: null,

                deductions: [],
                premiums: [],
              };
            }

            const emptyFinance =
              createEmptyUserFinance();

            return {
              payments: [],
              totalSalary: 0,

              goal: 0,
              goalMonthKey: null,

              deductions: [],
              premiums: [],

              financeByUser: {
                ...state.financeByUser,

                [state.currentUserId]:
                  emptyFinance,
              },
            };
          }),

        deleteUserFinance: (userId) =>
          set((state) => {
            const financeByUser = {
              ...state.financeByUser,
            };

            delete financeByUser[userId];

            if (
              state.currentUserId ===
              userId
            ) {
              return {
                currentUserId: null,

                payments: [],
                totalSalary: 0,

                goal: 0,
                goalMonthKey: null,

                deductions: [],
                premiums: [],

                financeByUser,
              };
            }

            return {
              financeByUser,
            };
          }),
      }),

      {
        name: "salary-calculator-finance",

        skipHydration: true,

        merge: (
          persistedState,
          currentState
        ) => {
          const persisted =
            persistedState as Partial<FinanceState>;

          return {
            ...currentState,
            ...persisted,

            currentUserId: null,

            payments: [],
            totalSalary: 0,

            goal: 0,
            goalMonthKey: null,

            deductions: [],
            premiums: [],
          };
        },
      }
    )
  );