"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { requestMagicLink } from "@/lib/customer-auth";

type State = "idle" | "loading" | "sent" | "error";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    setErrorMsg("");
    setDevUrl(null);
    try {
      const data = await requestMagicLink(email.trim().toLowerCase());
      if (data.magic_url) setDevUrl(data.magic_url);
      setState("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-navy via-gold to-navy" />

          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-widest font-semibold text-gold mb-1">
                {brand.name}
              </p>
              <h1 className="text-2xl font-bold text-navy">Track Your Award</h1>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                Enter your email to receive a secure login link — no password needed.
              </p>
            </div>

            {state === "sent" ? (
              <SentState email={email} devUrl={devUrl} onBack={() => setState("idle")} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all"
                  />
                </div>

                {state === "error" && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="w-full bg-navy text-white rounded-lg py-3 text-sm font-semibold hover:bg-navy/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {state === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner /> Sending link…
                    </span>
                  ) : (
                    "Send Login Link"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Only registered award customers can log in.{" "}
          <a href="/apply" className="text-gold hover:underline font-medium">
            Check your eligibility →
          </a>
        </p>
      </div>
    </div>
  );
}

function SentState({
  email,
  devUrl,
  onBack,
}: {
  email: string;
  devUrl: string | null;
  onBack: () => void;
}) {
  return (
    <div className="text-center space-y-4">
      {/* Checkmark icon */}
      <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
        <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-navy text-sm">Check your inbox</p>
        <p className="text-gray-500 text-sm mt-1">
          If <strong className="text-gray-700">{email}</strong> is registered, a login link
          has been sent. It expires in 15 minutes.
        </p>
      </div>

      {/* Dev-mode shortcut */}
      {devUrl && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
          <p className="text-xs font-semibold text-amber-700 mb-1">Dev mode — use this link:</p>
          <a
            href={devUrl}
            className="text-xs text-amber-800 underline break-all"
          >
            {devUrl}
          </a>
        </div>
      )}

      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-600 underline"
      >
        Use a different email
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
