import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getAuthErrorResponse,
  requireUser,
  extendCurrentSession,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const currentUser = await requireUser();

    const body = await request.json();

    const {
      firstShiftDate,
      secondShiftDate,
      firstShiftType,
      secondShiftType,
      rememberLogin,
    } = body;

    if (
      !firstShiftDate ||
      !secondShiftDate ||
      !firstShiftType ||
      !secondShiftType
    ) {
      return NextResponse.json(
        {
          error: "Не заполнены данные смен",
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        firstShiftDate,
        secondShiftDate,
        firstShiftType,
        secondShiftType,

        isSetupCompleted: true,
      },
    });

    let sessionExpiresAt: string | null = null;

if (rememberLogin === true) {
  const session =
    await extendCurrentSession();

  sessionExpiresAt =
    session.expiresAt.toISOString();
}

return NextResponse.json({
      sessionExpiresAt,
      id: updatedUser.id,

      firstShiftDate:
        updatedUser.firstShiftDate,

      secondShiftDate:
        updatedUser.secondShiftDate,

      firstShiftType:
        updatedUser.firstShiftType,

      secondShiftType:
        updatedUser.secondShiftType,

      isSetupCompleted:
        updatedUser.isSetupCompleted,
    });
  } catch (error) {
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

    console.error(
      "Failed to complete setup:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось завершить настройку",
      },
      {
        status: 500,
      }
    );
  }
}