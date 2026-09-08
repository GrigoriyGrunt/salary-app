import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getAuthErrorResponse,
  requireUser,
} from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();

    const notifications =
      await prisma.dismissedNotification.findMany({
        where: {
          userId: user.id,
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
    const authError =
      getAuthErrorResponse(error);

    if (authError) {
      return authError;
    }

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
      notificationId,
    } = body;

    if (!notificationId) {
      return NextResponse.json(
        {
          error: "Не указано уведомление",
        },
        {
          status: 400,
        }
      );
    }

    const user = await requireUser();

    await prisma.dismissedNotification.upsert({
      where: {
        userId_notificationId: {
          userId: user.id,
          notificationId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        notificationId,
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