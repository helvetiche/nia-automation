import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/adminConfig";

interface AuthResult {
  uid: string;
  email: string | undefined;
  role: string;
}

export async function requireAuth(
  request: NextRequest,
): Promise<{ error: NextResponse } | { user: AuthResult }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "missing auth token" },
        { status: 401 },
      ),
    };
  }

  const token = authHeader.substring(7);

  if (!token || token.length < 10) {
    return {
      error: NextResponse.json({ error: "invalid token" }, { status: 401 }),
    };
  }

  try {
    const decodedToken = await adminAuth().verifyIdToken(token, true);

    if (!decodedToken.uid) {
      return {
        error: NextResponse.json({ error: "invalid token" }, { status: 401 }),
      };
    }

    return {
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: (decodedToken.role as string) || "user",
      },
    };
  } catch {
    return {
      error: NextResponse.json({ error: "invalid token" }, { status: 401 }),
    };
  }
}

export async function requireOperator(
  request: NextRequest,
): Promise<{ error: NextResponse } | { user: AuthResult }> {
  const authResult = await requireAuth(request);

  if ("error" in authResult) {
    return authResult;
  }

  if (authResult.user.role !== "operator") {
    return {
      error: NextResponse.json(
        { error: "operator role required" },
        { status: 403 },
      ),
    };
  }

  return authResult;
}
