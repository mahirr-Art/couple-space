"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Sparkles, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleDevLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // Create dev user if not exists
      const registerRes = await fetch("/api/auth/register/dev", {
        method: "POST",
      });

      if (!registerRes.ok) {
        setError("Geliştirici hesabı oluşturulamadı");
        setLoading(false);
        return;
      }

      // Log in
      const res = await signIn("credentials", {
        email: "dev@couple.space",
        password: "password123",
        redirect: false,
      });

      if (res?.error) {
        setError("Hızlı giriş yapılamadı");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Hızlı giriş sırasında bir hata oluştu");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      // Login flow
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("E-posta veya şifre hatalı");
          setLoading(false);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } catch (err) {
        setError("Giriş yapılırken bir hata oluştu");
        setLoading(false);
      }
    } else {
      // Register flow
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Kayıt sırasında bir hata oluştu");
          setLoading(false);
        } else {
          // Successfully registered, auto login
          const loginRes = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (loginRes?.error) {
            setIsLogin(true);
            setError("Kayıt başarılı, lütfen giriş yapın");
            setLoading(false);
          } else {
            router.push("/pair");
            router.refresh();
          }
        }
      } catch (err) {
        setError("Kayıt sırasında bir hata oluştu");
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pulse-slow pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
          >
            <Heart className="w-8 h-8 text-primary fill-primary" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-1">
            CoupleSpace <Sparkles className="w-4 h-4 text-secondary" />
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            {isLogin ? "Kendi özel dünyanıza giriş yapın" : "İkinize özel bir dünya kurun"}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1"
            >
              <label className="text-xs font-semibold tracking-wide uppercase opacity-70">İsim</label>
              <input
                type="text"
                required={!isLogin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn. Mahir"
                className="w-full px-4 py-3 rounded-xl border border-glass-border bg-background/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
              />
            </motion.div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wide uppercase opacity-70">E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="isim@örnek.com"
              className="w-full px-4 py-3 rounded-xl border border-glass-border bg-background/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wide uppercase opacity-70">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-glass-border bg-background/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              "Giriş Yap"
            ) : (
              "Kayıt Ol & Başlat"
            )}
          </motion.button>

          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-glass-border w-full absolute" />
            <span className="bg-background/90 backdrop-blur-md px-3 text-[10px] text-foreground/45 font-bold uppercase relative z-10">Veya</span>
          </div>

          <motion.button
            type="button"
            onClick={handleDevLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs shadow-sm hover:shadow-primary/5 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              "Tek Tıkla Hızlı Giriş (Test Modu)"
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-medium hover:text-primary transition-colors cursor-pointer text-foreground/60"
          >
            {isLogin ? (
              <>Hesabınız yok mu? <span className="text-primary font-bold">Kayıt Olun</span></>
            ) : (
              <>Zaten üye misiniz? <span className="text-primary font-bold">Giriş Yapın</span></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
