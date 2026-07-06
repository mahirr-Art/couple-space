"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Star, Film, Compass, Plus, X, Sparkles, AlertCircle, Heart } from "lucide-react";

export default function BucketListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bucket" | "movies">("bucket");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("travel"); // default for bucket list

  // Review Form State
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/bucket-list");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // If active tab is movies, overwrite category to 'film'
    const finalCategory = activeTab === "movies" ? "film" : category;

    try {
      const res = await fetch("/api/bucket-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category: finalCategory,
        }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setCategory("travel");
        setShowAddModal(false);
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean, isFilm: boolean) => {
    const nextStatus = !currentStatus;
    
    if (nextStatus && isFilm) {
      // If completing a film, open the rating modal
      const item = items.find(i => i.id === id);
      setSelectedReviewItem(item);
      return;
    }

    try {
      const res = await fetch("/api/bucket-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isCompleted: nextStatus,
        }),
      });

      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewItem) return;

    try {
      const res = await fetch("/api/bucket-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReviewItem.id,
          isCompleted: true,
          rating,
          notes,
        }),
      });

      if (res.ok) {
        setRating(5);
        setNotes("");
        setSelectedReviewItem(null);
        fetchItems();
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

  // Filter items
  const bucketList = items.filter((i) => i.category !== "film");
  const movieList = items.filter((i) => i.category === "film");

  const activeItems = activeTab === "bucket" ? bucketList : movieList;
  const pendingItems = activeItems.filter((i) => !i.isCompleted);
  const completedItems = activeItems.filter((i) => i.isCompleted);

  const completionPercent = activeItems.length > 0 
    ? Math.round((completedItems.length / activeItems.length) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Bucket List & Filmler <Compass className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Birlikte yapılacaklar listesi oluşturun veya izleyeceğiniz filmleri puanlayıp yorumlayın.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-foreground/5 p-1 border border-glass-border">
            <button
              onClick={() => setActiveTab("bucket")}
              className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "bucket"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Bucket List</span>
            </button>
            <button
              onClick={() => setActiveTab("movies")}
              className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "movies"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>İzlenecek Filmler</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md self-start"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === "bucket" ? "Hedef Ekle" : "Film Ekle"}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Panel */}
      {activeItems.length > 0 && (
        <div className="glass rounded-3xl p-6 border border-glass-border">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-foreground/60">Tamamlama Oranı</span>
            <span className="text-primary">{completionPercent}% ({completedItems.length}/{activeItems.length})</span>
          </div>
          <div className="w-full bg-foreground/5 h-2.5 rounded-full overflow-hidden border border-glass-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
            />
          </div>
        </div>
      )}

      {/* Main List Grid */}
      {activeItems.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-sm mx-auto space-y-4">
          {activeTab === "bucket" ? (
            <Compass className="w-10 h-10 text-primary/45 mx-auto" />
          ) : (
            <Film className="w-10 h-10 text-primary/45 mx-auto" />
          )}
          <h3 className="text-lg font-bold">Liste henüz boş</h3>
          <p className="text-xs text-foreground/50">
            {activeTab === "bucket"
              ? "Birlikte gerçekleştirmek istediğiniz hedefleri ekleyin."
              : "Birlikte izlemek istediğiniz filmleri buraya kaydedin."}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            {activeTab === "bucket" ? "Hedef Ekle" : "Film Ekle"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Active/Pending Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/60 border-b border-glass-border pb-2 flex items-center gap-1">
              <span>Yapılacaklar</span> <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
            </h3>
            
            {pendingItems.length === 0 ? (
              <p className="text-xs italic text-foreground/40 text-center py-6">Tüm hedefler tamamlandı! 🎉</p>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl glass border border-glass-border flex items-start space-x-3 hover:shadow-sm transition-all"
                  >
                    <button
                      onClick={() => handleToggleComplete(item.id, item.isCompleted, item.category === "film")}
                      className="text-foreground/40 hover:text-primary transition-all cursor-pointer shrink-0 mt-0.5"
                    >
                      <Square className="w-5 h-5" />
                    </button>
                    <div>
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        {item.title}
                        {item.category !== "film" && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                            {item.category === "travel" ? "Seyahat" : item.category === "adventure" ? "Macera" : "Diğer"}
                          </span>
                        )}
                      </h4>
                      {item.description && <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Completed Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/60 border-b border-glass-border pb-2 flex items-center gap-1">
              <span>Tamamlananlar</span> <CheckSquare className="w-4 h-4 text-green-500" />
            </h3>

            {completedItems.length === 0 ? (
              <p className="text-xs italic text-foreground/40 text-center py-6">Henüz tamamlanan hedef yok.</p>
            ) : (
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl glass border border-green-500/10 bg-green-500/5 flex items-start space-x-3 transition-all"
                  >
                    <button
                      onClick={() => handleToggleComplete(item.id, item.isCompleted, item.category === "film")}
                      className="text-green-500 cursor-pointer shrink-0 mt-0.5"
                    >
                      <CheckSquare className="w-5 h-5 fill-green-500/10" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground/60 text-sm line-through flex items-center gap-2">
                        {item.title}
                      </h4>
                      
                      {item.description && <p className="text-xs text-foreground/45 mt-1 line-through">{item.description}</p>}
                      
                      {/* Movie rating review displays */}
                      {item.category === "film" && (item.rating !== null || item.notes) && (
                        <div className="mt-3 p-3 rounded-xl bg-background/40 border border-glass-border space-y-1.5">
                          {item.rating !== null && (
                            <div className="flex items-center space-x-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < item.rating ? "text-amber-500 fill-amber-500" : "text-foreground/10"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-[11px] italic text-foreground/70">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      )}

                      <span className="text-[9px] text-foreground/40 font-medium block mt-2">
                        Tamamlanma: {new Date(item.completedAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Item Modal */}
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
                  {activeTab === "bucket" ? "Yeni Hedef Belirle" : "İzlenecek Film Ekle"}{" "}
                  <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-foreground/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">
                    {activeTab === "bucket" ? "Hedef Başlığı" : "Film Adı"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeTab === "bucket" ? "Örn. İtalya seyahati yapmak" : "Örn. Interstellar"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Açıklama / Detaylar</label>
                  <input
                    type="text"
                    placeholder="Birlikte konuşulan detaylar..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                {activeTab === "bucket" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold opacity-70 block">Kategori</label>
                    <div className="flex space-x-2">
                      {[
                        { val: "travel", label: "Seyahat" },
                        { val: "adventure", label: "Macera" },
                        { val: "other", label: "Diğer" },
                      ].map((cat) => (
                        <button
                          key={cat.val}
                          type="button"
                          onClick={() => setCategory(cat.val)}
                          className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            category === cat.val
                              ? "bg-primary border-primary text-white"
                              : "bg-background/20 border-glass-border text-foreground/75"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm shadow-md cursor-pointer hover:bg-primary/95 transition-all mt-4"
                >
                  {activeTab === "bucket" ? "Listeye Ekle" : "İzleneceklere Ekle"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Movie Review Modal */}
      <AnimatePresence>
        {selectedReviewItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReviewItem(null)}
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
                  Filmi Değerlendirin <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </h3>
                <button
                  onClick={() => setSelectedReviewItem(null)}
                  className="p-1 rounded-lg hover:bg-foreground/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <p className="text-xs text-foreground/60">
                  <span className="font-bold text-foreground">"{selectedReviewItem.title}"</span> filmini izlediniz! Puanınızı ve ortak yorumunuzu ekleyin.
                </p>

                {/* Star rating selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold opacity-70">Puanınız</label>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starVal = idx + 1;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRating(starVal)}
                          className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              starVal <= rating ? "text-amber-500 fill-amber-500" : "text-foreground/20"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Ortak Film Yorumu</label>
                  <textarea
                    rows={4}
                    placeholder="Film hakkında neler düşündünüz?..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm shadow-md cursor-pointer hover:bg-primary/95 transition-all mt-4"
                >
                  Değerlendirmeyi Kaydet
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
