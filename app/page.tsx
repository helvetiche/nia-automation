"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase/clientConfig";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "login failed");
        setLoading(false);
        return;
      }

      await signInWithCustomToken(auth, data.token);
      router.push("/console");
    } catch {
      setError("something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl p-8">
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-nia-automation.jpg"
                alt="NIA Automation"
                className="w-16 h-16 object-cover flex-shrink-0"
              />
              <h1 className="text-3xl font-bold text-gray-800">
                Operation and<br />Maintenance
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Automated system that creates overall summary of LIPA
            </p>
          </div>

          <form onSubmit={loginUser} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition text-sm"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition text-sm"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Enter your email and password to sign in
          </p>
        </div>
      </div>
    </div>
  );
}
