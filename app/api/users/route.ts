import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  getAuthErrorResponse,
  requireAdmin,
  requireUser,
} from "@/lib/auth";

const userSelect = {
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

  scheduleChanges: {
    orderBy: {
      changeDate: "asc",
    },
  },

  createdAt: true,
  updatedAt: true,
} as const;

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: userSelect,
    });

    return NextResponse.json(users);
  } catch (error) {
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

    console.error(
      "Failed to get users:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось получить пользователей",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    await requireAdmin();

    const body = await request.json();

    const {
      lastName,
      firstName,
      middleName,
      login,
      accessCode,
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
          error:
            "Не заполнены обязательные поля",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          login,
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
        lastName,
        firstName,
        middleName,

        login,
        accessCodeHash,

        role: "employee",
      },
      select: userSelect,
    });

    return NextResponse.json(
      user,
      {
        status: 201,
      }
    );
  } catch (error) {
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

    console.error(
      "Failed to create user:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось создать пользователя",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const currentUser =
      await requireUser();

    const body = await request.json();

    const {
      id,

      lastName,
      firstName,
      middleName,
      login,
      accessCode,
      oldAccessCode,
      role,

      warehouse,
      position,
      schedule,
      hireDate,

      firstShiftDate,
      firstShiftType,

      secondShiftDate,
      secondShiftType,

      isSetupCompleted,
      scheduleChanges,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Не указан ID пользователя",
        },
        {
          status: 400,
        }
      );
    }

    const isOwnProfile =
      id === currentUser.id;

    const isAdmin =
      currentUser.role === "admin";

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "Недостаточно прав",
        },
        {
          status: 403,
        }
      );
    }

    if (login) {
      const existingUser =
        await prisma.user.findUnique({
          where: {
            login,
          },
        });

      if (
        existingUser &&
        existingUser.id !== id
      ) {
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
    }

    const data: any = {};

    if (lastName !== undefined) {
      data.lastName = lastName;
    }

    if (firstName !== undefined) {
      data.firstName = firstName;
    }

    if (middleName !== undefined) {
      data.middleName = middleName;
    }

    if (login !== undefined) {
      data.login = login;
    }

    if (
      role !== undefined &&
      isAdmin
    ) {
      data.role = role;
    }

    if (accessCode) {
      if (
        isOwnProfile &&
        !isAdmin
      ) {
        if (
          oldAccessCode === undefined
        ) {
          return NextResponse.json(
            {
              error:
                "Не указан старый код",
            },
            {
              status: 400,
            }
          );
        }

        const userForCode =
          await prisma.user.findUnique({
            where: {
              id: currentUser.id,
            },
            select: {
              accessCodeHash: true,
            },
          });

        if (!userForCode) {
          return NextResponse.json(
            {
              error:
                "Пользователь не найден",
            },
            {
              status: 404,
            }
          );
        }

        const isOldCodeCorrect =
          await bcrypt.compare(
            oldAccessCode,
            userForCode.accessCodeHash
          );

        if (!isOldCodeCorrect) {
          return NextResponse.json(
            {
              error:
                "Старый код введён неверно",
            },
            {
              status: 400,
            }
          );
        }
      }

      data.accessCodeHash =
        await bcrypt.hash(
          accessCode,
          10
        );
    }

    if (warehouse !== undefined) {
      data.warehouse = warehouse;
    }

    if (position !== undefined) {
      data.position = position;
    }

    if (schedule !== undefined) {
      data.schedule = schedule;
    }

    if (hireDate !== undefined) {
      data.hireDate = hireDate;
    }

    if (
      firstShiftDate !== undefined
    ) {
      data.firstShiftDate =
        firstShiftDate;
    }

    if (
      firstShiftType !== undefined
    ) {
      data.firstShiftType =
        firstShiftType;
    }

    if (
      secondShiftDate !== undefined
    ) {
      data.secondShiftDate =
        secondShiftDate;
    }

    if (
      secondShiftType !== undefined
    ) {
      data.secondShiftType =
        secondShiftType;
    }

    if (
      isSetupCompleted !== undefined
    ) {
      data.isSetupCompleted =
        isSetupCompleted;
    }

    if (
      scheduleChanges !== undefined
    ) {
      if (
        !Array.isArray(
          scheduleChanges
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Некорректные изменения графика",
          },
          {
            status: 400,
          }
        );
      }

      data.scheduleChanges = {
        deleteMany: {},
        create: scheduleChanges.map(
          (change) => ({
            changeDate:
              new Date(
                change.changeDate
              ),

            schedule:
              change.schedule,

            firstShiftDate:
              change.firstShiftDate
                ? new Date(
                    change.firstShiftDate
                  ).toISOString()
                : null,

            firstShiftType:
              change.firstShiftType ??
              null,

            secondShiftDate:
              change.secondShiftDate
                ? new Date(
                    change.secondShiftDate
                  ).toISOString()
                : null,

            secondShiftType:
              change.secondShiftType ??
              null,
          })
        ),
      };
    }

    const user =
      await prisma.user.update({
        where: {
          id,
        },
        data,
        select: userSelect,
      });

    return NextResponse.json(user);
  } catch (error) {
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

    console.error(
      "Failed to update user:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось обновить пользователя",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    await requireAdmin();

    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Не указан ID пользователя",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

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
      "Failed to delete user:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось удалить пользователя",
      },
      {
        status: 500,
      }
    );
  }
}