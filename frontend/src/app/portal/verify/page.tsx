"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCustomerAuth } from "@/lib/customer-auth";

type State = "verifying" | "success" | "error";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const { login } = useCustomerAuth();
  const router = useRouter();
  const [state, setState] = useState<State>("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setState("error");
      setErrorMsg("No login token found in this link. Please request a new one.");
      return;
    }

    login(token)
      .then(() => {
        setState("success");
        // Short delay so the user sees the success state, then redirect
        setTimeout(() => router.replace("/portal/dashboard"), 1200);
      })
      .catch((err: Error) => {
        setState("error");
        setErrorMsg(err.message);
      });
  }, [token, login, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <div className="w-full max-w-sm text-center">
        {state === "verifying" && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-navy/5 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-navy animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="font-semibold text-navy">Verifying your link…</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-navy">Verified! Redirecting…</p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-semibold text-navy mb-2">Link invalid or expired</p>
            <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
            <a
              href="/portal/login"
              className="inline-block bg-navy text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-navy/90 transition-colors"
            >
              Request a new link
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
