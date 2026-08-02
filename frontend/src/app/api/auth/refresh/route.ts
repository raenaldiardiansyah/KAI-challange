import { NextRequest, NextResponse } from "next/server";
import { refreshLoginSession } from "@/lib/auth/session";
import { rejectUntrustedMutation } from "@/lib/auth/requestSecurity";

export async function POST(request: NextRequest) {
const rejected = rejectUntrustedMutation(request);
if (rejected) return rejected;

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
