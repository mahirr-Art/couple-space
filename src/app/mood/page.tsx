"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, TrendingUp, Sparkles, User, Calendar, Plus, X } from "lucide-react";

const MOODS = [
  { value: 1, label: "Üzgün", emoji: "😢", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { value: 2, label: "Yorgun", emoji: "🥱", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { value: 3, label: "Normal", emoji: "🙂", color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
  { value: 4, label: "Mutlu", emoji: "😊", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  { value: 5, label: "Aşık", emoji: "😍", color: "text-red-500 bg-red-500/10 border-red-500/20" },
];

export default function MoodPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [logging, setLogging] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/mood");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleLogMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood === null) return;
    setLogging(true);

    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood,
          note,
        }),
      });

      if (res.ok) {
        setSelectedMood(null);
        setNote("");
        setShowAddModal(false);
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Group logs for rendering a custom SVG line chart of mood levels
  // Filter for last 7 entries to draw a simple line
  const reverseLogs = [...logs].reverse().slice(-7);
  const points = reverseLogs.map((log, idx) => {
    const x = 50 + idx * 80;
    const y = 160 - (log.mood - 1) * 30; // mapping 1-5 to coords
    return { x, y, ...log };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Mood Tracker <Smile className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Gününüzü değerlendirin, partnerinizin hislerine kulak verin ve ruh halinizin zamanla değişimini gözlemleyin.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Mod Gir</span>
        </button>
      </div>

      {/* Chart & History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Custom SVG Line Chart */}
        <div className="md:col-span-2 glass rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              Ruh Hali Değişimi <TrendingUp className="w-5 h-5 text-primary" />
            </h3>
            <p className="text-xs text-foreground/50">Son günlerdeki genel mod grafiğiniz.</p>
          </div>

          {points.length < 2 ? (
            <div className="py-20 text-center text-foreground/40 text-xs italic">
              Grafiğin çizilmesi için en az 2 gün mod girmelisiniz.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 600 200" className="w-full min-w-[500px] h-48 overflow-visible">
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Guide Lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="40"
                    y1={160 - i * 30}
                    x2="560"
                    y2={160 - i * 30}
                    stroke="currentColor"
                    className="text-foreground/10"
                    strokeDasharray="4"
                  />
                ))}

                {/* Filled Area */}
                {points.length > 1 && (
                  <path
                    d={`M ${points[0].x} 160 L ${polylinePoints} L ${points[points.length - 1].x} 160 Z`}
                    fill="url(#chart-grad)"
                  />
                )}

                {/* Line Path */}
                <polyline
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  points={polylinePoints}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="6"
                      fill="var(--background)"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      className="cursor-pointer hover:scale-125 transition-transform"
                    />
                    <text
                      x={p.x}
                      y={p.y - 12}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-foreground"
                    >
                      {MOODS.find((m) => m.value === p.mood)?.emoji}
                    </text>
                    <text
                      x={p.x}
                      y="185"
                      textAnchor="middle"
                      className="text-[8px] font-semibold fill-foreground/50"
                    >
                      {new Date(p.createdAt).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* History logs */}
        <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-extrabold text-lg">Mod Günlükleri</h3>
            <p className="text-xs text-foreground/50 font-semibold">Tüm geçmiş mod girdileri.</p>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs italic text-foreground/45 text-center py-8">Henüz mod girilmemiş.</p>
          ) : (
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
              {logs.map((log) => {
                const config = MOODS.find((m) => m.value === log.mood) || MOODS[2];
                return (
                  <div key={log.id} className="p-3.5 rounded-2xl glass border border-glass-border flex items-start space-x-3.5">
                    <span className="text-3xl shrink-0">{config.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 text-[10px] font-bold">
                        <span className="text-foreground/75 flex items-center gap-1">
                          <User className="w-3 h-3" /> {log.user.name}
                        </span>
                        <span className="text-foreground/45 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-foreground">{config.label}</p>
                      {log.note && <p className="text-xs text-foreground/70 italic mt-1 leading-relaxed">"{log.note}"</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Add Mood Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/4 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/6 w-full max-w-lg glass rounded-3xl p-6 md:p-8 shadow-2xl z-50 bg-background/95"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                  Ruh Halinizi Kaydedin <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-foreground/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLogMood} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold opacity-70 block text-center">Nasıl Hissediyorsunuz?</label>
                  <div className="grid grid-cols-5 gap-3">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setSelectedMood(m.value)}
                        className={`py-4 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer ${
                          selectedMood === m.value
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                            : "bg-background/25 border-glass-border hover:bg-foreground/5"
                        }`}
                      >
                        <span className="text-3xl">{m.emoji}</span>
                        <span className="text-[10px] font-bold">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Açıklama / Detaylar (İsteğe bağlı)</label>
                  <textarea
                    rows={4}
                    placeholder="Neden böyle hissettiğinizi kısaca not edin..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={logging || selectedMood === null}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm shadow-md cursor-pointer hover:bg-primary/95 transition-all disabled:opacity-50 mt-4"
                >
                  {logging ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Kaydet"
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
