import { NextResponse } from "next/server";
import { refreshLoginSession } from "@/lib/auth/session";

export async function POST() {
  try {
    const accessToken = await refreshLoginSession();
    if (!accessToken) {
      return NextResponse.json({ detail: "Session tidak dapat diperbarui." }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ detail: "RAMS Backend tidak dapat dihubungi." }, { status: 503 });
  }
}
