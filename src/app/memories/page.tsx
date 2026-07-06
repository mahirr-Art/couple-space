"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Camera,
  Grid,
  List,
  Sparkles,
  Heart,
  X
} from "lucide-react";

const SAMPLE_IMGS = [
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&q=80&w=600",
];

export default function MemoriesPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"timeline" | "gallery">("timeline");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSample, setSelectedSample] = useState<number | null>(null);

  const fetchMemories = async () => {
    try {
      const res = await fetch("/api/memories");
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleSelectSample = (idx: number) => {
    setSelectedSample(idx);
    setMediaUrl(SAMPLE_IMGS[idx]);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          date: date || new Date().toISOString(),
          mediaUrl: mediaUrl || SAMPLE_IMGS[0],
          mediaType: "image",
        }),
      });

      if (res.ok) {
        // Reset form
        setTitle("");
        setDescription("");
        setDate("");
        setMediaUrl("");
        setSelectedSample(null);
        setShowAddModal(false);
        fetchMemories();
      }
    } catch (err) {
      console.error(err);
    }
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
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Anılarımız & Galeri <Heart className="w-6 h-6 text-primary fill-primary" />
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Birlikte geçirdiğiniz en değerli anları ölümsüzleştirin.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Toggle buttons */}
          <div className="flex rounded-xl bg-foreground/5 p-1 border border-glass-border">
            <button
              onClick={() => setViewMode("timeline")}
              className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                viewMode === "timeline"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Zaman Çizelgesi</span>
            </button>
            <button
              onClick={() => setViewMode("gallery")}
              className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                viewMode === "gallery"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Galeri</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Anı Ekle</span>
          </button>
        </div>
      </div>

      {/* Main View Panel */}
      {memories.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <Camera className="w-12 h-12 text-primary/40 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold">Henüz anı eklenmemiş</h3>
          <p className="text-xs text-foreground/50">
            Güzel anılarınızı kaydetmek için "Yeni Anı Ekle" butonuna basın.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            İlk Anıyı Ekle
          </button>
        </div>
      ) : viewMode === "timeline" ? (
        /* Vertical Timeline */
        <div className="relative max-w-2xl mx-auto pl-8 border-l-2 border-dashed border-primary/30 py-4 space-y-8">
          {memories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline Indicator Dot */}
              <span className="absolute -left-[41px] top-4 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-sm">
                <Heart className="w-3 h-3 text-primary fill-primary" />
              </span>

              {/* Memory Card */}
              <div className="glass rounded-3xl overflow-hidden hover:shadow-xl transition-all border border-glass-border">
                {memory.mediaUrl && (
                  <img
                    src={memory.mediaUrl}
                    alt={memory.title}
                    className="w-full h-56 object-cover"
                  />
                )}
                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(memory.date).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <h3 className="text-xl font-bold text-foreground">{memory.title}</h3>
                  {memory.description && (
                    <p className="text-xs text-foreground/70 leading-relaxed">{memory.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Photo Gallery Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-3xl overflow-hidden group border border-glass-border flex flex-col justify-between"
            >
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={memory.mediaUrl || SAMPLE_IMGS[0]}
                  alt={memory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(memory.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-foreground text-sm truncate">{memory.title}</h4>
                {memory.description && (
                  <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">{memory.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
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
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/4 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/4 w-full max-w-xl glass rounded-3xl p-6 md:p-8 shadow-2xl z-50 bg-background/95 overflow-y-auto max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                  Yeni Anı Kaydet <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-foreground/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMemory} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Anı Başlığı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn. Kapadokya Tatilimiz"
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
                  <label className="text-xs font-semibold opacity-70">Açıklama / Detaylar</label>
                  <textarea
                    rows={3}
                    placeholder="O güne dair hislerinizi veya özel anları yazın..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold opacity-70 block">Görsel Seçin</label>
                  {/* Select Samples */}
                  <div className="grid grid-cols-5 gap-2">
                    {SAMPLE_IMGS.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSample(idx)}
                        className={`aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          selectedSample === idx ? "border-primary scale-105" : "border-transparent"
                        }`}
                      >
                        <img src={url} alt="sample" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] text-foreground/40 mb-1">Veya kendi görsel bağlantınızı (URL) girin:</p>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={mediaUrl}
                      onChange={(e) => {
                        setMediaUrl(e.target.value);
                        setSelectedSample(null);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm shadow-md cursor-pointer hover:bg-primary/95 transition-all mt-4"
                >
                  Anıyı Kaydet
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
