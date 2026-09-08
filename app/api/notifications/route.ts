import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          error: "Не указан ID пользователя",
        },
        {
          status: 400,
        }
      );
    }

    const notifications =
      await prisma.dismissedNotification.findMany({
        where: {
          userId,
        },
        select: {
          notificationId: true,
        },
      });

    return NextResponse.json({
      dismissedNotifications: notifications.map(
        (notification) =>
          notification.notificationId
      ),
    });
  } catch (error) {
    console.error(
      "Failed to get dismissed notifications:",
      error
    );

    return NextResponse.json(
      {
        error: "Не удалось получить уведомления",
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
      userId,
      notificationId,
    } = body;

    if (!userId || !notificationId) {
      return NextResponse.json(
        {
          error:
            "Не указан пользователь или уведомление",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.dismissedNotification.upsert({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        },
      },
      update: {},
      create: {
        userId,
        notificationId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to dismiss notification:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Не удалось закрыть уведомление",
      },
      {
        status: 500,
      }
    );
  }
}