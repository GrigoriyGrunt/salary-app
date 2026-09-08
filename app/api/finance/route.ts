import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getAuthErrorResponse,
  requireUser,
} from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();

    const [
      financeSettings,
      payments,
      deductions,
      premiums,
    ] = await Promise.all([
      prisma.financeSettings.findUnique({
        where: {
          userId: user.id,
        },
      }),

      prisma.payment.findMany({
        where: {
          userId: user.id,
        },

        orderBy: {
          date: "asc",
        },
      }),

      prisma.deduction.findMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.premium.findMany({
        where: {
          userId: user.id,
        },
      }),
    ]);

    return NextResponse.json({
      totalSalary:
        financeSettings?.totalSalary ?? 0,

      goal:
        financeSettings?.goal ?? 0,

      goalMonthKey:
        financeSettings?.goalMonthKey ?? null,

      payments,
      deductions,
      premiums,
    });
  } catch (error) {
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

    console.error(
      "Failed to load finance:",
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось загрузить финансовые данные",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const {
      totalSalary,
      goal,
      goalMonthKey,
      payments,
      deductions,
      premiums,
    } = body;

    if (
      !Array.isArray(payments) ||
      !Array.isArray(deductions) ||
      !Array.isArray(premiums)
    ) {
      return NextResponse.json(
        {
          error:
            "Некорректные финансовые данные",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.financeSettings.upsert({
          where: {
            userId: user.id,
          },

          update: {
            totalSalary:
              Number(totalSalary) || 0,

            goal:
              Number(goal) || 0,

            goalMonthKey:
              goalMonthKey ?? null,
          },

          create: {
            userId: user.id,

            totalSalary:
              Number(totalSalary) || 0,

            goal:
              Number(goal) || 0,

            goalMonthKey:
              goalMonthKey ?? null,
          },
        });

        await tx.payment.deleteMany({
          where: {
            userId: user.id,
          },
        });

        if (payments.length > 0) {
          await tx.payment.createMany({
            data: payments.map(
              (payment) => ({
                id: String(payment.id),

                userId: user.id,

                date: payment.date,
                type: payment.type,
                amount: payment.amount,
                monthKey: payment.monthKey,
              })
            ),
          });
        }

        await tx.deduction.deleteMany({
          where: {
            userId: user.id,
          },
        });

        if (deductions.length > 0) {
          await tx.deduction.createMany({
            data: deductions.map(
              (deduction) => ({
                id: String(deduction.id),

                userId: user.id,

                type: deduction.type,
                amount: deduction.amount,
                monthKey:
                  deduction.monthKey,
              })
            ),
          });
        }

        await tx.premium.deleteMany({
          where: {
            userId: user.id,
          },
        });

        if (premiums.length > 0) {
          await tx.premium.createMany({
            data: premiums.map(
              (premium) => ({
                id: String(premium.id),

                userId: user.id,

                amount: premium.amount,
                comment: premium.comment,
                monthKey: premium.monthKey,
              })
            ),
          });
        }
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

    console.error(
      "Failed to save finance:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось сохранить финансовые данные",
      },
      {
        status: 500,
      }
    );
  }
}