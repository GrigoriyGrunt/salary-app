import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: "Не указан ID пользователя",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction([
      prisma.scheduleChange.deleteMany({
        where: {
          userId: id,
        },
      }),

      prisma.shift.deleteMany({
        where: {
          userId: id,
        },
      }),

      prisma.originalMainShift.deleteMany({
        where: {
          userId: id,
        },
      }),

      prisma.payment.deleteMany({
        where: {
          userId: id,
        },
      }),

      prisma.deduction.deleteMany({
        where: {
          userId: id,
        },
      }),

      prisma.premium.deleteMany({
        where: {
          userId: id,
        },
      }),

      prisma.financeSettings.deleteMany({
        where: {
          userId: id,
        },
      }),

      prisma.dismissedNotification.deleteMany({
        where: {
          userId: id,
        },
      }),

      prisma.user.update({
        where: {
          id,
        },
        data: {
          warehouse: "",
          position: "",
          schedule: "",
          hireDate: "",

          firstShiftDate: "",
          firstShiftType: "",

          secondShiftDate: "",
          secondShiftType: "",

          isSetupCompleted: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to reset user:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось сбросить данные пользователя",
      },
      {
        status: 500,
      }
    );
  }
}