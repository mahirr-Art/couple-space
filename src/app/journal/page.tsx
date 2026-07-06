"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Calendar, User, AlignLeft, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          date: date || new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setDate("");
        setShowWriteModal(false);
        fetchEntries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedEntry(expandedEntry === id ? null : id);
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
            Ortak Günlük & Notlar <BookOpen className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Günün özetini yazın, özel hisleri paylaşın ve birlikte bir anı defteri oluşturun.
          </p>
        </div>

        <button
          onClick={() => setShowWriteModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Günü Yaz</span>
        </button>
      </div>

      {/* Diary Entries List */}
      {entries.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-sm mx-auto space-y-4">
          <BookOpen className="w-10 h-10 text-primary/40 mx-auto" />
          <h3 className="text-lg font-bold">Günlük henüz boş</h3>
          <p className="text-xs text-foreground/50">
            İlk notunuzu ekleyerek bu sayfayı renklendirin.
          </p>
          <button
            onClick={() => setShowWriteModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Not Yaz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry) => {
            const isExpanded = expandedEntry === entry.id;

            return (
              <motion.div
                key={entry.id}
                layout
                className="glass rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-glass-border hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-foreground/50 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(entry.date).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {entry.author.name}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-foreground mb-3">{entry.title}</h3>
                  
                  <p className={`text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap ${isExpanded ? "" : "line-clamp-4"}`}>
                    {entry.content}
                  </p>
                </div>

                <button
                  onClick={() => toggleExpand(entry.id)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-primary mt-4 self-start hover:underline cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <span>Küçült</span> <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Devamını Oku</span> <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Write Diary Modal */}
      <AnimatePresence>
        {showWriteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWriteModal(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/4 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/6 w-full max-w-xl glass rounded-3xl p-6 md:p-8 shadow-2xl z-50 bg-background/95 overflow-y-auto max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                  Bugünün Günlüğü <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <button
                  onClick={() => setShowWriteModal(false)}
                  className="p-1 rounded-lg hover:bg-foreground/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Konu / Başlık</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn. Harika Bir Pazar Günü"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Tarih</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Yazı İçeriği</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Bugün neler oldu? Neler hissettiniz?..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm shadow-md cursor-pointer hover:bg-primary/95 transition-all mt-4"
                >
                  Günlüğe Ekle
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
