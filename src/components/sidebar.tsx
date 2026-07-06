"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./theme-provider";
import {
  Heart,
  Home,
  MessageSquare,
  Image as ImageIcon,
  BookOpen,
  Calendar,
  CheckSquare,
  Smile,
  MapPin,
  Music,
  Lock,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/chat", label: "Sohbet", icon: MessageSquare },
  { href: "/memories", label: "Anılar & Galeri", icon: ImageIcon },
  { href: "/journal", label: "Günlük & Notlar", icon: BookOpen },
  { href: "/calendar", label: "Takvim & Özel Günler", icon: Calendar },
  { href: "/bucket-list", label: "Bucket List", icon: CheckSquare },
  { href: "/mood", label: "Mood Tracker", icon: Smile },
  { href: "/map", label: "Harita", icon: MapPin },
  { href: "/spotify", label: "Spotify", icon: Music },
  { href: "/time-capsule", label: "Zaman Kapsülü", icon: Lock },
  { href: "/profile", label: "Profil & İstatistikler", icon: User },
];

export function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // If path is auth or pair or home, don't show shell
  const isAuthPage = pathname === "/auth" || pathname === "/pair" || pathname === "/";
  if (isAuthPage) return <>{children}</>;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center space-x-2 px-3 py-4 mb-4">
          <Heart className="w-6 h-6 text-primary fill-primary animate-pulse" />
          <span className="font-semibold text-lg tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-1">
            CoupleSpace <Sparkles className="w-3 h-3 text-secondary" />
          </span>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group cursor-pointer ${
                    isActive
                      ? "text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-bg"
                      className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? "text-primary" : "text-foreground/60 group-hover:text-foreground"}`} />
                  <span className="relative z-10">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Actions & System Info */}
      <div className="space-y-2 pt-4 border-t border-glass-border">
        {session?.user && (
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shadow-md">
              {session.user.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-foreground/50 truncate">Paired</p>
            </div>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all cursor-pointer"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-5 h-5 text-yellow-500" />
              <span>Gündüz Modu</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-indigo-500" />
              <span>Gece Modu</span>
            </>
          )}
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/auth" })}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 glass border-r border-glass-border shrink-0 sticky top-0 h-screen z-20">
        {navContent}
      </aside>

      {/* Mobile Top Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 glass border-b border-glass-border sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-primary fill-primary animate-pulse" />
            <span className="font-semibold text-base tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CoupleSpace
            </span>
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1 rounded-lg hover:bg-foreground/5 transition-all text-foreground"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-64 bg-background/95 backdrop-blur-md border-r border-glass-border z-50 md:hidden h-full"
              >
                <div className="flex justify-between items-center p-4 border-b border-glass-border">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-primary fill-primary" />
                    <span className="font-semibold text-base tracking-wider">CoupleSpace</span>
                  </div>
                  <button onClick={() => setIsMobileOpen(false)} className="p-1">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {navContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
