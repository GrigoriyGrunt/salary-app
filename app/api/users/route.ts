import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,

        lastName: true,
        firstName: true,
        middleName: true,

        login: true,

        role: true,
        isSetupCompleted: true,

        warehouse: true,
        position: true,
        schedule: true,
        hireDate: true,

        firstShiftDate: true,
        firstShiftType: true,

        secondShiftDate: true,
        secondShiftType: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to get users:", error);

    return NextResponse.json(
      {
        error: "Не удалось получить пользователей",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      lastName,
      firstName,
      middleName,
      login,
      accessCode,
      role = "employee",
    } = body;

    if (
      !lastName ||
      !firstName ||
      !middleName ||
      !login ||
      !accessCode
    ) {
      return NextResponse.json(
        {
          error: "Не заполнены обязательные поля",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        login,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Пользователь с таким логином уже существует",
        },
        {
          status: 409,
        }
      );
    }

    const accessCodeHash = await bcrypt.hash(accessCode, 10);

    const user = await prisma.user.create({
      data: {
        lastName,
        firstName,
        middleName,

        login,
        accessCodeHash,

        role,
      },

      select: {
        id: true,

        lastName: true,
        firstName: true,
        middleName: true,

        login: true,

        role: true,
        isSetupCompleted: true,

        warehouse: true,
        position: true,
        schedule: true,
        hireDate: true,

        firstShiftDate: true,
        firstShiftType: true,

        secondShiftDate: true,
        secondShiftType: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create user:", error);

    return NextResponse.json(
      {
        error: "Не удалось создать пользователя",
      },
      {
        status: 500,
      }
    );
  }
}