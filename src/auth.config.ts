import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = 
        nextUrl.pathname.startsWith("/dashboard") || 
        nextUrl.pathname.startsWith("/chat") || 
        nextUrl.pathname.startsWith("/memories") || 
        nextUrl.pathname.startsWith("/journal") || 
        nextUrl.pathname.startsWith("/spotify") || 
        nextUrl.pathname.startsWith("/time-capsule") || 
        nextUrl.pathname.startsWith("/calendar") || 
        nextUrl.pathname.startsWith("/bucket-list") || 
        nextUrl.pathname.startsWith("/mood") || 
        nextUrl.pathname.startsWith("/map") || 
        nextUrl.pathname.startsWith("/profile") || 
        nextUrl.pathname.startsWith("/pair");

      if (isOnProtected) {
        if (isLoggedIn) {
          // If logged in but not paired, and trying to go to protected features, redirect to /pair
          const isPaired = !!(auth.user as any).coupleId;
          if (!isPaired && nextUrl.pathname !== "/pair") {
            return Response.redirect(new URL("/pair", nextUrl));
          }
          if (isPaired && nextUrl.pathname === "/pair") {
            return Response.redirect(new URL("/dashboard", nextUrl));
          }
          return true;
        }
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === "/auth") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
