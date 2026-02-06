import { adminAuth } from "@/lib/firebase/adminConfig";

export async function verifyOperator(token: string) {
  const decodedToken = await adminAuth().verifyIdToken(token);

  if (decodedToken.role !== "operator") {
    throw new Error("not authorized - operator role required");
  }

  return decodedToken;
}
