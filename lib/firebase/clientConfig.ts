import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { clientEnv } from "@/lib/config/env";

const firebaseConfig = {
  apiKey: clientEnv.firebase.apiKey,
  authDomain: clientEnv.firebase.authDomain,
  projectId: clientEnv.firebase.projectId,
  storageBucket: clientEnv.firebase.storageBucket,
  messagingSenderId: clientEnv.firebase.messagingSenderId,
  appId: clientEnv.firebase.appId,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
