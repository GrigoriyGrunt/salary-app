import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      lastName,
      firstName,
      middleName,
      login,
      accessCode,
    } = body;

    if (
      !lastName?.trim() ||
      !firstName?.trim() ||
      !middleName?.trim() ||
      !login?.trim() ||
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
if (
  !/^[А-Яа-яЁё]+(?:[ -][А-Яа-яЁё]+)*$/.test(lastName.trim()) ||
  !/^[А-Яа-яЁё]+(?:[ -][А-Яа-яЁё]+)*$/.test(firstName.trim()) ||
  !/^[А-Яа-яЁё]+(?:[ -][А-Яа-яЁё]+)*$/.test(middleName.trim())
) {
  return NextResponse.json(
    { error: "ФИО должно содержать только русские буквы, пробелы и дефисы" },
    { status: 400 }
  );
}
    if (!/^[A-Za-z0-9.!]+$/.test(login.trim())) {
      return NextResponse.json(
        {
          error:
            "Логин может содержать только английские буквы, цифры, точку и восклицательный знак",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^\d{4,}$/.test(accessCode)) {
      return NextResponse.json(
        {
          error:
            "Код должен содержать минимум 4 цифры",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          login: login.trim(),
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Пользователь с таким логином уже существует",
        },
        {
          status: 409,
        }
      );
    }

    const accessCodeHash =
      await bcrypt.hash(accessCode, 10);

    const user = await prisma.user.create({
      data: {
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        login: login.trim(),
        accessCodeHash,
        role: "employee",
      },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        middleName: true,
        login: true,
        role: true,
        isSetupCompleted: true,
      },
    });

    return NextResponse.json(
      user,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to register user:",
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось создать профиль",
      },
      {
        status: 500,
      }
    );
  }
}