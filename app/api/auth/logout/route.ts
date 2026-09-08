import { NextResponse } from "next/server";

import { deleteCurrentSession } from "@/lib/auth";

export async function POST() {
  try {
    await deleteCurrentSession();

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Не удалось выйти из аккаунта",
      },
      {
        status: 500,
      }
    );
  }
}