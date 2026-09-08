import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest
) {
  try {
    const userId =
      request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          error: "Не указан userId",
        },
        {
          status: 400,
        }
      );
    }

    const [
      financeSettings,
      payments,
      deductions,
      premiums,
    ] = await Promise.all([
      prisma.financeSettings.findUnique({
        where: {
          userId,
        },
      }),

      prisma.payment.findMany({
        where: {
          userId,
        },

        orderBy: {
          date: "asc",
        },
      }),

      prisma.deduction.findMany({
        where: {
          userId,
        },
      }),

      prisma.premium.findMany({
        where: {
          userId,
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
    const body = await request.json();

    const {
      userId,
      totalSalary,
      goal,
      goalMonthKey,
      payments,
      deductions,
      premiums,
    } = body;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Не указан userId",
        },
        {
          status: 400,
        }
      );
    }

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
            userId,
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
            userId,

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
            userId,
          },
        });

        if (payments.length > 0) {
          await tx.payment.createMany({
            data: payments.map(
              (payment) => ({
                id: String(payment.id),

                userId,

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
            userId,
          },
        });

        if (deductions.length > 0) {
          await tx.deduction.createMany({
            data: deductions.map(
              (deduction) => ({
                id: String(deduction.id),

                userId,

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
            userId,
          },
        });

        if (premiums.length > 0) {
          await tx.premium.createMany({
            data: premiums.map(
              (premium) => ({
                id: String(premium.id),

                userId,

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