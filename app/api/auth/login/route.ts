import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/adminConfig";
import { sanitizeString, isValidEmail } from "@/lib/validation/sanitize";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = sanitizeString(body.email, 255);
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password needed" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "invalid email format" },
        { status: 400 },
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "invalid password format" },
        { status: 400 },
      );
    }

    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    const attemptKey = `${email}-${clientIp}`;
    const attempts = loginAttempts.get(attemptKey);

    if (attempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;

      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        if (timeSinceLastAttempt < LOCKOUT_DURATION) {
          return NextResponse.json(
            { error: "too many attempts, try again later" },
            { status: 429 },
          );
        } else {
          loginAttempts.delete(attemptKey);
        }
      }
    }

    const auth = adminAuth();
    let user;

    try {
      user = await auth.getUserByEmail(email);
    } catch {
      loginAttempts.set(attemptKey, {
        count: (attempts?.count || 0) + 1,
        lastAttempt: Date.now(),
      });

      return NextResponse.json(
        { error: "wrong email or password" },
        { status: 401 },
      );
    }

    if (!user) {
      loginAttempts.set(attemptKey, {
        count: (attempts?.count || 0) + 1,
        lastAttempt: Date.now(),
      });

      return NextResponse.json(
        { error: "wrong email or password" },
        { status: 401 },
      );
    }

    try {
      const userRecord = await auth.getUser(user.uid);

      if (userRecord.disabled) {
        return NextResponse.json(
          { error: "account disabled" },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "authentication failed" },
        { status: 500 },
      );
    }

    loginAttempts.delete(attemptKey);

    const token = await auth.createCustomToken(user.uid);

    return NextResponse.json({
      token,
      user: { uid: user.uid, email: user.email },
    });
  } catch {
    return NextResponse.json(
      { error: "something broke on our end" },
      { status: 500 },
    );
  }
}
