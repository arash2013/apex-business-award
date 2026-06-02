import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  // Protect all /admin routes; withAuth automatically skips the signIn page
  matcher: ["/admin/:path*"],
};
