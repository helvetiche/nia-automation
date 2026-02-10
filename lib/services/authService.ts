import { adminAuth } from "@/lib/firebase/adminConfig";
import { DecodedIdToken } from "firebase-admin/auth";

interface AuthResult {
  success: boolean;
  user?: {
    uid: string;
    email: string;
    role: string;
  };
  error?: string;
}

export async function verifyUserToken(token: string): Promise<AuthResult> {
  try {
    const decodedToken: DecodedIdToken = await adminAuth().verifyIdToken(token);

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        role: (decodedToken.role as string) || "user",
      },
    };
  } catch {
    return {
      success: false,
      error: "invalid token",
    };
  }
}

export async function createUserToken(email: string): Promise<AuthResult> {
  try {
    const auth = adminAuth();
    const user = await auth.getUserByEmail(email);

    if (!user) {
      return {
        success: false,
        error: "wrong email or password",
      };
    }

    const customToken = await auth.createCustomToken(user.uid);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email || "",
        role: "operator",
      },
      error: customToken,
    };
  } catch {
    return {
      success: false,
      error: "authentication failed",
    };
  }
}
