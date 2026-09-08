import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { login, accessCode } = body;

    if (!login || !accessCode) {
      return NextResponse.json(
        {
          error: "Введите логин и код доступа",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        login,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Неверный логин или код доступа",
        },
        {
          status: 401,
        }
      );
    }

    const isAccessCodeValid = await bcrypt.compare(
      accessCode,
      user.accessCodeHash
    );

    if (!isAccessCodeValid) {
      return NextResponse.json(
        {
          error: "Неверный логин или код доступа",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      id: user.id,

      lastName: user.lastName,
      firstName: user.firstName,
      middleName: user.middleName,

      login: user.login,

      role: user.role,
      isSetupCompleted: user.isSetupCompleted,

      warehouse: user.warehouse,
      position: user.position,
      schedule: user.schedule,
      hireDate: user.hireDate,

      firstShiftDate: user.firstShiftDate,
      firstShiftType: user.firstShiftType,

      secondShiftDate: user.secondShiftDate,
      secondShiftType: user.secondShiftType,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Failed to login:", error);

    return NextResponse.json(
      {
        error: "Не удалось выполнить вход",
      },
      {
        status: 500,
      }
    );
  }
}