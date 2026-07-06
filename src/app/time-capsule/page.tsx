"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Plus, Calendar, Clock, Sparkles, X, Heart, Eye } from "lucide-react";

export default function TimeCapsulePage() {
  const [capsules, setCapsules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");

  const fetchCapsules = async () => {
    try {
      const res = await fetch("/api/time-capsule");
      if (res.ok) {
        const data = await res.json();
        setCapsules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, []);

  const handleCreateCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !unlockDate) return;

    try {
      const res = await fetch("/api/time-capsule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          unlockDate,
        }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setUnlockDate("");
        setShowAddModal(false);
        fetchCapsules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Human readable time remaining
  const getTimeRemaining = (dateStr: string) => {
    const total = Date.parse(dateStr) - Date.parse(new Date().toString());
    if (total <= 0) return "Açılabilir";

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} gün ${hours} saat`;
    if (hours > 0) return `${hours} saat ${minutes} dakika`;
    return `${minutes} dakika`;
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Geleceğe Zaman Kapsülü <Lock className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Gelecekteki kendinize veya partnerinize mesajlar kilitleyin. Belirlediğiniz güne kadar gizli kalacaktır.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Kapsül Oluştur</span>
        </button>
      </div>

      {/* Time Capsules Grid */}
      {capsules.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-sm mx-auto space-y-4">
          <Clock className="w-10 h-10 text-primary/45 mx-auto" />
          <h3 className="text-lg font-bold">Kapsül kutusu boş</h3>
          <p className="text-xs text-foreground/50">
            Geleceğe ilk mesajınızı kilitleyin.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Mesaj Kilitle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {capsules.map((capsule) => {
            const isLocked = capsule.isLocked;

            return (
              <motion.div
                key={capsule.id}
                whileHover={{ y: -4 }}
                onClick={() => !isLocked && setSelectedCapsule(capsule)}
                className={`glass rounded-3xl p-6 flex flex-col justify-between border cursor-pointer transition-all min-h-[200px] ${
                  isLocked
                    ? "border-glass-border opacity-90 cursor-not-allowed"
                    : "border-primary/20 hover:shadow-lg shadow-sm"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${isLocked ? "bg-foreground/5 text-foreground/40" : "bg-primary/10 text-primary"}`}>
                      {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLocked ? "bg-foreground/5 text-foreground/45" : "bg-green-500/10 text-green-500"}`}>
                      {isLocked ? "Kilitli" : "Açık"}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-base mb-1">{capsule.title}</h3>
                  <p className="text-xs text-foreground/50">
                    Oluşturulma: {new Date(capsule.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-glass-border flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground/50 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Kilit Açılış: {new Date(capsule.unlockDate).toLocaleDateString("tr-TR")}
                  </span>
                  
                  {isLocked ? (
                    <span className="text-primary font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {getTimeRemaining(capsule.unlockDate)}
                    </span>
                  ) : (
                    <span className="text-green-500 font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Oku
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Capsule Modal */}
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
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/4 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/6 w-full max-w-lg glass rounded-3xl p-6 md:p-8 shadow-2xl z-50 bg-background/95 overflow-y-auto max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                  Zaman Kapsülü Kilitle <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-foreground/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCapsule} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Kapsül Başlığı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn. 1. Yılımızda Açılacak Mektup"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Kilit Açılma Tarihi</label>
                  <input
                    type="date"
                    required
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Geleceğe Mesajınız</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Zamanı geldiğinde okunacak mektubunuzu buraya yazın..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm shadow-md cursor-pointer hover:bg-primary/95 transition-all mt-4"
                >
                  Kapsülü Kilitle
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Capsule Modal */}
      <AnimatePresence>
        {selectedCapsule && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCapsule(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/4 md:left-1/2 md:-translate-x-1/2 w-full max-w-xl glass rounded-3xl p-8 shadow-2xl z-50 bg-background/95"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2 text-primary">
                  <Unlock className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wide">Kilit Açıldı</span>
                </div>
                <button
                  onClick={() => setSelectedCapsule(null)}
                  className="p-1 rounded-lg hover:bg-foreground/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-foreground">{selectedCapsule.title}</h2>
                <div className="text-[10px] text-foreground/40 flex items-center space-x-4">
                  <span>Kilit açılış: {new Date(selectedCapsule.unlockDate).toLocaleDateString("tr-TR")}</span>
                  <span>Yazılış: {new Date(selectedCapsule.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
                
                <hr className="border-glass-border my-2" />

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-sm text-foreground leading-relaxed whitespace-pre-wrap font-serif italic text-center">
                  "{selectedCapsule.content}"
                </div>

                <div className="flex items-center justify-center space-x-1 text-primary text-xs font-semibold pt-4">
                  <Heart className="w-4 h-4 fill-primary" />
                  <span>Sonsuza Dek Birlikte</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
