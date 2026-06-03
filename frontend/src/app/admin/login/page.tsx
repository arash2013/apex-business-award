"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { brand } from "@/config/brand";

function LoginForm() {
  const params = useSearchParams();
  const error = params.get("error");

  function handleSignIn() {
    window.location.href = "/.auth/login/aad?post_login_redirect_uri=/admin/pipeline";
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-gold">
          {brand.name}
        </p>
        <h1 className="text-2xl font-bold text-navy mt-2">Admin Portal</h1>
        <p className="text-sm text-gray-400 mt-1">
          Sign in with your Microsoft account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            Your account does not have admin access. Contact the site owner.
          </p>
        </div>
      )}

      <button
        onClick={handleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-navy text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-navy/90 active:scale-[0.98] transition-all"
      >
        {/* Microsoft icon */}
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="9" height="9" fill="#F25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
          <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
        Sign in with Microsoft
      </button>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
