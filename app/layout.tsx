import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastContainer";
import { headers } from "next/headers";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NIA Automation",
  description: "Operations & Maintenance",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
        {nonce && (
          <Script
            id="firebase-init"
            nonce={nonce}
            strategy="beforeInteractive"
          />
        )}
      </body>
    </html>
  );
}
