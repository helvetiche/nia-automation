function validateEnv(key: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const serverEnv = {
  firebase: {
    type: validateEnv("FIREBASE_SERVICE_ACCOUNT_TYPE", process.env.FIREBASE_SERVICE_ACCOUNT_TYPE),
    projectId: validateEnv("FIREBASE_SERVICE_ACCOUNT_PROJECT_ID", process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID),
    privateKeyId: validateEnv("FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID", process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID),
    privateKey: validateEnv("FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY", process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY),
    clientEmail: validateEnv("FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL", process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL),
    clientId: validateEnv("FIREBASE_SERVICE_ACCOUNT_CLIENT_ID", process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID),
    authUri: validateEnv("FIREBASE_SERVICE_ACCOUNT_AUTH_URI", process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI),
    tokenUri: validateEnv("FIREBASE_SERVICE_ACCOUNT_TOKEN_URI", process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI),
    authProviderCertUrl: validateEnv("FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL", process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL),
    clientCertUrl: validateEnv("FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL", process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL),
    universeDomain: validateEnv("FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN", process.env.FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN),
    storageBucket: validateEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  },
  gemini: {
    apiKey: validateEnv("GEMINI_API_KEY", process.env.GEMINI_API_KEY),
  },
  ai: {
    model: process.env.AI_MODEL || "gemini-2.5-flash-lite",
    inputPricePerMillion: parseFloat(process.env.AI_INPUT_PRICE_PER_MILLION || "0.15"),
    outputPricePerMillion: parseFloat(process.env.AI_OUTPUT_PRICE_PER_MILLION || "1.25"),
  },
};

export const clientEnv = {
  firebase: {
    apiKey: validateEnv("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: validateEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: validateEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: validateEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: validateEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: validateEnv("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  },
};
