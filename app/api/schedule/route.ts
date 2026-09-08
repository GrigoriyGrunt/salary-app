import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

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

    const [shifts, originalMainShifts] = await Promise.all([
      prisma.shift.findMany({
        where: {
          userId,
        },
        orderBy: {
          date: "asc",
        },
      }),

      prisma.originalMainShift.findMany({
        where: {
          userId,
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
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

    if (!userId || !date) {
      return NextResponse.json(
        {
          error: "Не указан userId или date",
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
          userId,
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
        userId,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      shifts,
      originalMainShiftsByMonth,
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
          const normalizedDate = normalizeDate(
            shift.date
          );

          await tx.shift.upsert({
            where: {
              userId_date: {
                userId,
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
              userId,
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
                  userId,
                  monthKey,
                },
              },

              update: {
                count: Number(count),
              },

              create: {
                userId,
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