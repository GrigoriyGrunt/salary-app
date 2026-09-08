import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getAuthErrorResponse,
  requireUser,
} from "@/lib/auth";

export async function POST() {
  try {
    const user = await requireUser();

    await prisma.$transaction([
      prisma.scheduleChange.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.shift.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.originalMainShift.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.payment.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.deduction.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.premium.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.financeSettings.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.dismissedNotification.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.user.update({
        where: {
          id: user.id,
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
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

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