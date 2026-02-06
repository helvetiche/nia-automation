import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/adminConfig";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password needed" },
        { status: 400 },
      );
    }

    const auth = adminAuth();
    const user = await auth.getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "wrong email or password" },
        { status: 401 },
      );
    }

    const token = await auth.createCustomToken(user.uid);

    return NextResponse.json({
      token,
      user: { uid: user.uid, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "something broke on our end" },
      { status: 500 },
    );
  }
}
