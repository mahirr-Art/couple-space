"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { NavigationShell } from "./sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system" storageKey="couple-space-theme">
        <NavigationShell>{children}</NavigationShell>
      </ThemeProvider>
    </SessionProvider>
  );
}
