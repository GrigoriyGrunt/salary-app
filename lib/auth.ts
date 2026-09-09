import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "salary_app_session";

const TEMPORARY_SESSION_DURATION =
  5 * 60 * 1000;

const REMEMBERED_SESSION_DURATION =
  30 * 24 * 60 * 60 * 1000;

type SessionDuration =
  | "temporary"
  | "remembered";

function getSessionExpiresAt(
  duration: SessionDuration
) {
  const durationMs =
    duration === "remembered"
      ? REMEMBERED_SESSION_DURATION
      : TEMPORARY_SESSION_DURATION;

  return new Date(Date.now() + durationMs);
}

export async function createSession(
  userId: string,
  duration: SessionDuration
) {
  const expiresAt =
    getSessionExpiresAt(duration);

  const session =
    await prisma.session.create({
      data: {
        userId,
        expiresAt,
      },
    });

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    session.id,
    {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    }
  );

  return session;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();

  const sessionId =
    cookieStore.get(
      SESSION_COOKIE_NAME
    )?.value;

  if (!sessionId) {
    return null;
  }

  const session =
    await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });

  if (!session) {
    return null;
  }

  if (
    session.expiresAt.getTime() <=
    Date.now()
  ) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    cookieStore.delete(
      SESSION_COOKIE_NAME
    );

    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session =
    await getCurrentSession();

  return session?.user ?? null;
}

export async function extendCurrentSession() {
  const session =
    await getCurrentSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const expiresAt =
    getSessionExpiresAt("remembered");

  const updatedSession =
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt,
      },
      include: {
        user: true,
      },
    });

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    updatedSession.id,
    {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    }
  );

  return updatedSession;
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();

  const sessionId =
    cookieStore.get(
      SESSION_COOKIE_NAME
    )?.value;

  if (sessionId) {
    await prisma.session.deleteMany({
      where: {
        id: sessionId,
      },
    });
  }

  cookieStore.delete(
    SESSION_COOKIE_NAME
  );
}

export async function requireUser() {
  const user =
    await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin() {
  const user =
    await requireUser();

  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export function getAuthErrorResponse(
  error: unknown
) {
  if (
    error instanceof Error &&
    error.message === "UNAUTHORIZED"
  ) {
    return NextResponse.json(
      {
        error: "Не авторизован",
      },
      {
        status: 401,
      }
    );
  }

  if (
    error instanceof Error &&
    error.message === "FORBIDDEN"
  ) {
    return NextResponse.json(
      {
        error: "Недостаточно прав",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}