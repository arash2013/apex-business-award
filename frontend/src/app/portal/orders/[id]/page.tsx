"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCustomerAuth, customerFetch } from "@/lib/customer-auth";

interface Fulfillment {
  id: string;
  fulfillment_type: string;
  status: string;
  file_url: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

interface Order {
  id: string;
  tier: string;
  status: string;
  amount: string;
  currency: string;
  paid_at: string | null;
  created_at: string;
  award_name: string;
  award_year: number;
  business_name: string;
  fulfillments: Fulfillment[];
}

const FULFILLMENT_LABELS: Record<string, string> = {
  digital_badge: "Digital Badge",
  certificate: "Certificate",
  social_kit: "Social Media Kit",
  plaque: "Physical Plaque",
};

const FULFILLMENT_ICONS: Record<string, string> = {
  digital_badge: "🏅",
  certificate: "📜",
  social_kit: "📱",
  plaque: "🪵",
};

const STATUS_STEPS = ["pending", "processing", "generated", "shipped", "delivered"];

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  paid: "bg-green-50 text-green-700 border border-green-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
  refunded: "bg-gray-100 text-gray-600 border border-gray-200",
  cancelled: "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function OrderDetailPage() {
  const { session, loading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.replace("/portal/login");
      return;
    }
    customerFetch(`/orders/${id}`, session.access_token)
      .then(setOrder)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [session, authLoading, id, router]);

  if (authLoading || loading) return <Skeleton />;
  if (!session) return null;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <Link href="/portal/dashboard" className="mt-4 inline-block text-sm text-gold hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Back */}
      <Link href="/portal/dashboard" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-6">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to dashboard
      </Link>

      {/* Order header */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className={`h-1.5 ${order.tier === "premium" ? "bg-gold" : order.tier === "pro" ? "bg-navy" : "bg-gray-300"}`} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-navy leading-tight">{order.award_name}</h1>
              <p className="text-sm text-gray-500 mt-1">{order.business_name}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${ORDER_STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
            <Detail label="Tier" value={capitalize(order.tier)} />
            <Detail label="Amount" value={`$${Number(order.amount).toFixed(0)}`} />
            <Detail label="Year" value={String(order.award_year)} />
            <Detail label="Ordered" value={formatDate(order.created_at)} />
          </div>

          {order.paid_at && (
            <p className="text-xs text-green-600 mt-3">
              ✓ Payment confirmed {formatDate(order.paid_at)}
            </p>
          )}
        </div>
      </div>

      {/* Fulfillments */}
      {order.status === "paid" && (
        <section>
          <h2 className="text-base font-semibold text-navy mb-3">Award Items</h2>
          <div className="space-y-3">
            {order.fulfillments.length === 0 ? (
              <div className="bg-white rounded-xl p-5 shadow-sm text-sm text-gray-400">
                Fulfillment is being prepared. Check back soon.
              </div>
            ) : (
              order.fulfillments.map((f) => <FulfillmentItem key={f.id} f={f} />)
            )}
          </div>
        </section>
      )}

      {/* Support */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Questions about your order?{" "}
          <a href="mailto:awards@apexbusinessaward.com" className="text-gold hover:underline font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

function FulfillmentItem({ f }: { f: Fulfillment }) {
  const currentStep = STATUS_STEPS.indexOf(f.status);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl" aria-hidden="true">
          {FULFILLMENT_ICONS[f.fulfillment_type] ?? "📦"}
        </span>
        <div>
          <p className="font-semibold text-navy text-sm">
            {FULFILLMENT_LABELS[f.fulfillment_type] ?? f.fulfillment_type}
          </p>
          <p className="text-xs text-gray-400 capitalize">{f.status.replace("_", " ")}</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1 mb-4">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentStep;
          const current = i === currentStep;
          return (
            <div key={step} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full h-1 rounded-full transition-colors ${
                  done ? "bg-gold" : "bg-gray-100"
                } ${current ? "ring-2 ring-gold/30" : ""}`}
              />
              {i === 0 || i === STATUS_STEPS.length - 1 || current ? (
                <span className={`text-[9px] capitalize ${done ? "text-gold font-semibold" : "text-gray-300"}`}>
                  {step}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {f.file_url && (
        <a
          href={f.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy bg-navy/5 hover:bg-navy/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </a>
      )}

      {f.tracking_number && (
        <div className="mt-2 text-xs text-gray-500">
          Tracking: <span className="font-mono font-medium text-gray-700">{f.tracking_number}</span>
          {f.shipped_at && <span className="ml-2 text-gray-400">· Shipped {formatDate(f.shipped_at)}</span>}
        </div>
      )}

      {f.delivered_at && (
        <p className="mt-1 text-xs text-green-600">✓ Delivered {formatDate(f.delivered_at)}</p>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-navy mt-0.5">{value}</p>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
      <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
      <div className="bg-white rounded-2xl h-48 animate-pulse" />
      <div className="bg-white rounded-xl h-32 animate-pulse" />
    </div>
  );
}
