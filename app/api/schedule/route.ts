import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getAuthErrorResponse,
  requireUser,
} from "@/lib/auth";

function normalizeDate(date: string | Date) {
  const value = new Date(date);

  return new Date(
    Date.UTC(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    )
  );
}

export async function GET() {
  try {
    const user = await requireUser();

    const [shifts, originalMainShifts] =
      await Promise.all([
        prisma.shift.findMany({
          where: {
            userId: user.id,
          },
          orderBy: {
            date: "asc",
          },
        }),

        prisma.originalMainShift.findMany({
          where: {
            userId: user.id,
          },
        }),
      ]);

    const originalMainShiftsByMonth =
      Object.fromEntries(
        originalMainShifts.map((item) => [
          item.monthKey,
          item.count,
        ])
      );

    return NextResponse.json({
      shifts,
      originalMainShiftsByMonth,
    });
  } catch (error) {
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

    console.error(
      "Failed to get schedule:",
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось получить график",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const body = await request.json();

    const {
      date,
      type,
      workType,
      status,
      workZone,
      salaryHours,
      baseHours,
      tobaccoHours,
      boxes,
      blocks,
      nonProfileHours,
      mentor,
      transitionDistribution,
      isWorked,
    } = body;

    if (!date) {
      return NextResponse.json(
        {
          error: "Не указана date",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedDate = normalizeDate(date);

    const shift = await prisma.shift.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: normalizedDate,
        },
      },

      update: {
        type,
        workType,
        status,
        workZone,

        salaryHours,
        baseHours,
        tobaccoHours,

        boxes,
        blocks,
        nonProfileHours,

        mentor,

        transitionDistribution:
          transitionDistribution ?? null,

        isWorked,
      },

      create: {
        userId: user.id,
        date: normalizedDate,

        type,
        workType,
        status,
        workZone,

        salaryHours,
        baseHours,
        tobaccoHours,

        boxes,
        blocks,
        nonProfileHours,

        mentor,

        transitionDistribution:
          transitionDistribution ?? null,

        isWorked,
      },
    });

    return NextResponse.json(shift);
  } catch (error) {
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

    console.error(
      "Failed to save shift:",
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось сохранить смену",
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
      shifts,
      originalMainShiftsByMonth,
    } = body;

    if (!Array.isArray(shifts)) {
      return NextResponse.json(
        {
          error: "Некорректные данные графика",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction(
      async (tx) => {
        for (const shift of shifts) {
          const normalizedDate =
            normalizeDate(shift.date);

          await tx.shift.upsert({
            where: {
              userId_date: {
                userId: user.id,
                date: normalizedDate,
              },
            },

            update: {
              type: shift.type,
              workType: shift.workType,
              status: shift.status,
              workZone: shift.workZone,

              salaryHours:
                shift.salaryHours ?? 0,

              baseHours:
                shift.baseHours ?? 0,

              tobaccoHours:
                shift.tobaccoHours ?? 0,

              boxes:
                shift.boxes ?? 0,

              blocks:
                shift.blocks ?? 0,

              nonProfileHours:
                shift.nonProfileHours ?? 0,

              mentor:
                shift.mentor ?? false,

              transitionDistribution:
                shift.transitionDistribution ?? null,

              isWorked:
                shift.isWorked ?? false,
            },

            create: {
              userId: user.id,
              date: normalizedDate,

              type: shift.type,
              workType: shift.workType,
              status: shift.status,
              workZone: shift.workZone,

              salaryHours:
                shift.salaryHours ?? 0,

              baseHours:
                shift.baseHours ?? 0,

              tobaccoHours:
                shift.tobaccoHours ?? 0,

              boxes:
                shift.boxes ?? 0,

              blocks:
                shift.blocks ?? 0,

              nonProfileHours:
                shift.nonProfileHours ?? 0,

              mentor:
                shift.mentor ?? false,

              transitionDistribution:
                shift.transitionDistribution ?? null,

              isWorked:
                shift.isWorked ?? false,
            },
          });
        }

        if (
          originalMainShiftsByMonth &&
          typeof originalMainShiftsByMonth ===
            "object"
        ) {
          for (const [
            monthKey,
            count,
          ] of Object.entries(
            originalMainShiftsByMonth
          )) {
            await tx.originalMainShift.upsert({
              where: {
                userId_monthKey: {
                  userId: user.id,
                  monthKey,
                },
              },

              update: {
                count: Number(count),
              },

              create: {
                userId: user.id,
                monthKey,
                count: Number(count),
              },
            });
          }
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
      "Failed to save schedule:",
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось сохранить график",
      },
      {
        status: 500,
      }
    );
  }
}