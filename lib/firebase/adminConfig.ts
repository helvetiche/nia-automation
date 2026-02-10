import "server-only";
import * as admin from "firebase-admin";
import { serverEnv } from "@/lib/config/serverEnv";

const initAdmin = () => {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      type: serverEnv.firebase.type,
      project_id: serverEnv.firebase.projectId,
      private_key_id: serverEnv.firebase.privateKeyId,
      private_key: serverEnv.firebase.privateKey.replace(/\\n/g, "\n"),
      client_email: serverEnv.firebase.clientEmail,
      client_id: serverEnv.firebase.clientId,
      auth_uri: serverEnv.firebase.authUri,
      token_uri: serverEnv.firebase.tokenUri,
      auth_provider_x509_cert_url: serverEnv.firebase.authProviderCertUrl,
      client_x509_cert_url: serverEnv.firebase.clientCertUrl,
      universe_domain: serverEnv.firebase.universeDomain,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: serverEnv.firebase.storageBucket,
    });
  }
  return admin;
};

export const adminAuth = () => initAdmin().auth();
export const adminDb = () => initAdmin().firestore();
export const adminStorage = () => initAdmin().storage();
