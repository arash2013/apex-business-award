import { brand } from "@/config/brand";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <p className="text-xs uppercase tracking-widest font-semibold text-gold">
          {brand.name}
        </p>
        <h1 className="text-2xl font-bold text-navy mt-2">Access Denied</h1>
        <p className="text-sm text-gray-500 mt-3">
          Your account does not have the <strong>Apex.Admin</strong> role.
          Contact the site owner to request access.
        </p>
        <a
          href="/.auth/logout?post_logout_redirect_uri=/admin/login"
          className="mt-6 inline-block text-sm text-navy/50 hover:text-navy transition-colors"
        >
          Sign out and try a different account
        </a>
      </div>
    </div>
  );
}
