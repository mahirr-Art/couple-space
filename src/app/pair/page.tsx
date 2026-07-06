"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Copy, Check, LogOut, ArrowRight, Share2 } from "lucide-react";
import { signOut } from "next-auth/react";

export default function PairPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [partnerCode, setPartnerCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // If already paired, redirect to dashboard
  useEffect(() => {
    if (session?.user && (session.user as any).coupleId) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const copyCode = () => {
    if (session?.user && (session.user as any).pairCode) {
      navigator.clipboard.writeText((session.user as any).pairCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Eşleştirme yapılamadı");
        setLoading(false);
      } else {
        // Update session so client recognizes coupleId
        await update({
          coupleId: data.coupleId,
          partnerId: data.partnerId,
        });
        
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Bir bağlantı hatası oluştu");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4">
      {/* Background Blurs */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pulse-slow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl glass rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Partner Eşleştirme</h1>
          <p className="text-foreground/60 max-w-sm mt-2 text-sm">
            Couple Space'i kullanmaya başlamak için partnerinizle eşleşmeniz gerekir.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Your Code Section */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-foreground/5 border border-glass-border">
            <div>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground/70 mb-2 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-primary" /> Sizin Kodunuz
              </h2>
              <p className="text-xs text-foreground/50 mb-6">
                Bu kodu partnerinize gönderin, o kendi uygulamasına girerek sizinle eşleşebilir.
              </p>
            </div>
            <div className="flex items-center justify-between bg-background/50 border border-glass-border rounded-xl p-3 mt-auto">
              <span className="font-mono text-lg font-bold tracking-widest text-primary px-2">
                {(session?.user as any)?.pairCode || "Yükleniyor..."}
              </span>
              <button
                onClick={copyCode}
                className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/70 hover:text-foreground transition-all cursor-pointer"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Connect Partner Section */}
          <form onSubmit={handlePair} className="flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground/70 mb-2 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-secondary" /> Partnerinizin Kodu
                </h2>
                <p className="text-xs text-foreground/50">
                  Partnerinizin size gönderdiği 6 haneli eşleşme kodunu buraya girin.
                </p>
              </div>

              <input
                type="text"
                required
                maxLength={6}
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                placeholder="ÖRN. A8B9C2"
                className="w-full px-4 py-3 rounded-xl border border-glass-border bg-background/30 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all font-mono text-center text-lg font-bold tracking-widest uppercase"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-3.5 mt-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm shadow-md hover:shadow-secondary/20 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Eşleş ve Başla"
              )}
            </motion.button>
          </form>
        </div>

        <div className="mt-12 pt-6 border-t border-glass-border flex justify-between items-center">
          <div className="text-xs text-foreground/50">
            Giriş yapan: <span className="font-semibold text-foreground">{session?.user?.email}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth" })}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:underline cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Çıkış Yap
          </button>
        </div>
      </motion.div>
    </div>
  );
}
