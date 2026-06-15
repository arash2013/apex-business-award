"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  paid: "bg-green-50 text-green-700 border border-green-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
  refunded: "bg-gray-100 text-gray-600 border border-gray-200",
  cancelled: "bg-gray-100 text-gray-500 border border-gray-200",
};

const TIER_LABEL: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
};

export default function DashboardPage() {
  const { session, loading: authLoading, logout } = useCustomerAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.replace("/portal/login");
      return;
    }
    customerFetch("/orders", session.access_token)
      .then(setOrders)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingOrders(false));
  }, [session, authLoading, router]);

  if (authLoading) return <LoadingScreen />;
  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gold mb-1">
            Welcome back
          </p>
          <h1 className="text-2xl font-bold text-navy">
            {session.first_name} {session.last_name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{session.email}</p>
        </div>
        <button
          onClick={logout}
          className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
        >
          Sign out
        </button>
      </div>

      {/* Orders */}
      <section>
        <h2 className="text-lg font-semibold text-navy mb-4">Your Orders</h2>

        {loadingOrders && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse h-28" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loadingOrders && !error && orders.length === 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <p className="text-gray-400 text-sm">No orders found for your account.</p>
            <p className="text-gray-400 text-xs mt-1">
              Questions?{" "}
              <a href="mailto:awards@apexbusinessaward.com" className="text-gold hover:underline">
                Contact support
              </a>
            </p>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </section>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const overallFulfillment = getOverallFulfillmentStatus(order.fulfillments);

  return (
    <Link
      href={`/portal/orders/${order.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-50 overflow-hidden"
    >
      {/* Tier color bar */}
      <div className={`h-1 ${order.tier === "premium" ? "bg-gold" : order.tier === "pro" ? "bg-navy" : "bg-gray-300"}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-navy truncate">{order.award_name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{order.business_name} · {order.award_year}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
              {order.status}
            </span>
            <span className="text-xs text-gray-400">
              {TIER_LABEL[order.tier]} · ${Number(order.amount).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Fulfillment progress */}
        {order.status === "paid" && order.fulfillments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-500 font-medium">Fulfillment</span>
              <span className="text-gray-400">{overallFulfillment}</span>
            </div>
            <FulfillmentBar fulfillments={order.fulfillments} />
          </div>
        )}

        <p className="text-xs text-gray-300 mt-3">
          Ordered {formatDate(order.created_at)}
        </p>
      </div>
    </Link>
  );
}

function FulfillmentBar({ fulfillments }: { fulfillments: Fulfillment[] }) {
  const done = fulfillments.filter((f) => ["generated", "shipped", "delivered"].includes(f.status)).length;
  const pct = fulfillments.length > 0 ? (done / fulfillments.length) * 100 : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className="bg-gold h-1.5 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function getOverallFulfillmentStatus(fulfillments: Fulfillment[]): string {
  if (!fulfillments.length) return "Pending";
  const statuses = fulfillments.map((f) => f.status);
  if (statuses.every((s) => s === "delivered")) return "All delivered";
  if (statuses.some((s) => s === "shipped")) return "Partially shipped";
  if (statuses.some((s) => s === "generated")) return "In preparation";
  return "Pending";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <svg className="w-7 h-7 text-navy animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}
