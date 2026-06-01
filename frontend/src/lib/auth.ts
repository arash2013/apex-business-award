import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const ADMIN_ROLE = process.env.AZURE_AD_ADMIN_ROLE ?? "Apex.Admin";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "",
      authorization: {
        params: {
          // Request the roles claim in the id_token
          scope: "openid profile email",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ profile }) {
      const roles: string[] = (profile as Record<string, unknown>)
        ?.roles as string[] ?? [];
      return roles.includes(ADMIN_ROLE);
    },

    async jwt({ token, profile }) {
      if (profile) {
        token.roles = (profile as Record<string, unknown>)
          ?.roles as string[] ?? [];
      }
      return token;
    },

    async session({ session, token }) {
      session.roles = (token.roles as string[]) ?? [];
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
};
