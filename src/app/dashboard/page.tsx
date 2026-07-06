"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Calendar,
  Smile,
  ImageIcon,
  BookOpen,
  Music,
  ChevronRight,
  TrendingUp,
  Settings,
  Plus,
  Compass,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

const MOODS = [
  { value: 1, label: "Üzgün", emoji: "😢", color: "from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30" },
  { value: 2, label: "Yorgun", emoji: "🥱", color: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30" },
  { value: 3, label: "Normal", emoji: "🙂", color: "from-teal-500/20 to-emerald-500/20 text-teal-500 border-teal-500/30" },
  { value: 4, label: "Mutlu", emoji: "😊", color: "from-rose-500/20 to-pink-500/20 text-rose-500 border-rose-500/30" },
  { value: 5, label: "Aşık", emoji: "😍", color: "from-red-500/20 to-rose-600/20 text-red-500 border-red-500/30" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [moodNote, setMoodNote] = useState("");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [loggingMood, setLoggingMood] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Dashboard verileri alınamadı");
      const d = await res.json();
      setData(d);
    } catch (err) {
      setError("Veriler yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateAnniversary = async () => {
    if (!tempDate) return;
    try {
      const res = await fetch("/api/couple", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anniversaryDate: tempDate }),
      });
      if (res.ok) {
        setShowAnniversaryModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogMood = async (moodVal: number) => {
    setLoggingMood(true);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: moodVal, note: moodNote }),
      });
      if (res.ok) {
        setMoodNote("");
        setSelectedMood(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingMood(false);
    }
  };

  const getDaysTogether = (dateStr: string) => {
    const start = new Date(dateStr);
    const today = new Date();
    const diff = today.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="relative">
          <Heart className="w-12 h-12 text-primary fill-primary animate-pulse" />
          <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin w-12 h-12" />
        </div>
      </div>
    );
  }

  const daysTogether = data?.anniversaryDate ? getDaysTogether(data.anniversaryDate) : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Merhaba, {session?.user?.name || "Kullanıcı"}{" "}
            <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Bugün partnerinizle aranızdaki bağları güçlendirmek için harika bir gün.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAnniversaryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-foreground/5 text-sm font-semibold transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Ayarlar</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Relationship Counter Widget */}
        <motion.div
          whileHover={{ y: -4 }}
          className="md:col-span-2 glass rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="w-5 h-5 fill-primary" />
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Aşk Sayacı
            </span>
          </div>

          <div className="my-6">
            {daysTogether !== null ? (
              <div className="space-y-1">
                <span className="text-5xl md:text-6xl font-black text-foreground">{daysTogether}</span>
                <span className="text-lg font-bold text-foreground/70 ml-2">Gündür Birlikte</span>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Yıldönümü Tarihinizi Ekleyin</h3>
                <p className="text-xs text-foreground/50">Tarih girerek kaç gündür birlikte olduğunuzu görün.</p>
              </div>
            )}
          </div>

          <div>
            {data?.anniversaryDate ? (
              <p className="text-xs text-foreground/50 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Başlangıç: {new Date(data.anniversaryDate).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            ) : (
              <button
                onClick={() => setShowAnniversaryModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Yıldönümü Ayarla <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Partner Widget */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass rounded-3xl p-8 flex flex-col justify-between min-h-[220px]"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Smile className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              Partner Durumu
            </span>
          </div>

          <div className="my-4 space-y-3">
            {data?.partner ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md text-lg">
                    {data.partner.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{data.partner.name}</h3>
                    <p className="text-xs text-foreground/50">Şu Anki Modu</p>
                  </div>
                </div>

                {data.partner.latestMood ? (
                  <div className="p-3 rounded-xl bg-foreground/5 border border-glass-border flex items-center gap-3">
                    <span className="text-3xl">
                      {MOODS.find((m) => m.value === data.partner.latestMood.mood)?.emoji || "🙂"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        {MOODS.find((m) => m.value === data.partner.latestMood.mood)?.label}
                      </p>
                      {data.partner.latestMood.note && (
                        <p className="text-xs text-foreground/60 truncate">{data.partner.latestMood.note}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs italic text-foreground/50">Henüz bugün mod girmedi.</p>
                )}
              </>
            ) : (
              <p className="text-xs text-foreground/50">Partneriniz henüz daveti kabul etmedi.</p>
            )}
          </div>

          <div className="text-xs text-foreground/40 mt-auto">
            {data?.partner?.latestMood
              ? `${new Date(data.partner.latestMood.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} güncellendi`
              : "Veri yok"}
          </div>
        </motion.div>
      </div>

      {/* Dynamic Grid 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Quick Mood Logger */}
        <div className="glass rounded-3xl p-8 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              Modunu Güncelle <TrendingUp className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-xs text-foreground/50">Bugün nasıl hissediyorsunuz? Partneriniz görsün.</p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`py-3 rounded-xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedMood === m.value
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-background/20 border-glass-border hover:bg-foreground/5"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] font-medium">{m.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedMood !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Not ekle (örn. İşler çok yoğun...)"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-glass-border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                />
                <button
                  onClick={() => handleLogMood(selectedMood)}
                  disabled={loggingMood}
                  className="w-full py-2 bg-primary text-white font-semibold rounded-xl text-xs shadow-md cursor-pointer hover:bg-primary/90 transition-all flex justify-center"
                >
                  {loggingMood ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Kaydet"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Next Calendar Event Widget */}
        <div className="glass rounded-3xl p-8 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Sıradaki Etkinlik <Calendar className="w-4 h-4 text-secondary" />
              </h3>
              <Link href="/calendar">
                <div className="p-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 cursor-pointer">
                  <Plus className="w-4 h-4" />
                </div>
              </Link>
            </div>
            {data?.nextEvent ? (
              <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 space-y-2 mt-2">
                <p className="font-bold text-sm text-foreground">{data.nextEvent.title}</p>
                <p className="text-xs text-secondary font-medium">
                  {new Date(data.nextEvent.date).toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs italic text-foreground/50">Yaklaşan bir özel gün planlanmamış.</p>
              </div>
            )}
          </div>

          <Link href="/calendar">
            <div className="text-xs font-semibold text-secondary hover:underline cursor-pointer flex items-center gap-1 mt-4">
              Tüm Planları Gör <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Music Widget */}
        <div className="glass rounded-3xl p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -z-10" />
          <div>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              Spotify <Music className="w-4 h-4 text-green-500" />
            </h3>
            <p className="text-xs text-foreground/50">Şu anda ne dinliyorsunuz?</p>

            <div className="mt-4 p-3 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500 animate-spin" style={{ animationDuration: "12s" }}>
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">Aşk Şarkıları</p>
                <p className="text-[10px] text-foreground/60 truncate">Ortak çalma listeniz</p>
              </div>
            </div>
          </div>

          <Link href="/spotify">
            <div className="text-xs font-semibold text-green-500 hover:underline cursor-pointer flex items-center gap-1 mt-4">
              Spotify Bağla & Dinle <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

      </div>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Anılar", value: data?.stats?.totalMemories || 0, icon: ImageIcon, href: "/memories", color: "text-pink-500" },
          { label: "Günlük Notları", value: data?.stats?.totalJournalEntries || 0, icon: BookOpen, href: "/journal", color: "text-purple-500" },
          { label: "Sohbet Mesajları", value: data?.stats?.totalMessages || 0, icon: MessageSquare, href: "/chat", color: "text-indigo-500" },
          { label: "Bucket List", value: `${data?.stats?.bucketList?.completed || 0}/${data?.stats?.bucketList?.total || 0}`, icon: Compass, href: "/bucket-list", color: "text-teal-500" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} href={stat.href}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="glass rounded-2xl p-5 flex items-center space-x-4 cursor-pointer hover:bg-foreground/5 transition-all"
              >
                <div className={`p-3 rounded-xl bg-foreground/5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                  <p className="text-[11px] font-medium text-foreground/50">{stat.label}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Settings Modal (Anniversary set) */}
      <AnimatePresence>
        {showAnniversaryModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnniversaryModal(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/3 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-md glass rounded-3xl p-6 shadow-2xl z-50 bg-background/90"
            >
              <h3 className="text-lg font-bold mb-2">Ayarlar</h3>
              <p className="text-xs text-foreground/50 mb-4">İlişki başlangıç tarihinizi buraya girin.</p>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Birliktelik Başlangıcı</label>
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setShowAnniversaryModal(false)}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl border border-glass-border hover:bg-foreground/5 cursor-pointer text-foreground"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleUpdateAnniversary}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl bg-primary text-white shadow-md cursor-pointer hover:bg-primary/90"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
