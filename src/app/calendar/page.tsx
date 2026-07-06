"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Clock, Gift, Heart, Sparkles, X, ChevronRight, AlertCircle } from "lucide-react";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/calendar");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate) return;

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          eventDate,
          isRecurring,
        }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setEventDate("");
        setIsRecurring(false);
        setShowAddModal(false);
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diff = target.getTime() - today.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const upcomingEvents = events.filter((e) => getDaysRemaining(e.eventDate) >= 0);
  const pastEvents = events.filter((e) => getDaysRemaining(e.eventDate) < 0).reverse();
  const closestEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Takvim & Geri Sayım <Calendar className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Önemli günleri planlayın, yaklaşan tarihler için heyecanlı geri sayımları takip edin.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Etkinlik Planla</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Countdown & Past Events */}
        <div className="space-y-6">
          {/* Main Geri Sayım Card */}
          {closestEvent ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="glass rounded-3xl p-8 relative overflow-hidden bg-gradient-to-tr from-primary/10 to-secondary/10 border border-primary/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
              <div className="flex items-center space-x-2 text-primary mb-4">
                <Clock className="w-5 h-5 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider">En Yakın Özel Gün</span>
              </div>
              <h2 className="text-xl font-black text-foreground mb-4">{closestEvent.title}</h2>
              
              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-5xl font-black text-primary">{getDaysRemaining(closestEvent.eventDate)}</span>
                <span className="text-base font-bold text-foreground/70">gün kaldı</span>
              </div>

              <div className="text-xs text-foreground/50 flex items-center gap-1.5 border-t border-glass-border pt-4">
                <Gift className="w-4 h-4 text-secondary" />
                Tarih: {new Date(closestEvent.eventDate).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-3xl p-8 text-center space-y-3">
              <Gift className="w-10 h-10 text-foreground/30 mx-auto" />
              <h3 className="font-bold text-sm">Geri Sayım Yapacak Gün Yok</h3>
              <p className="text-xs text-foreground/50">Planlanmış bir etkinlik bulunmamaktadır.</p>
            </div>
          )}

          {/* Past Events */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-foreground/60 border-b border-glass-border pb-2">Geçmişte Kalanlar</h3>
            {pastEvents.length === 0 ? (
              <p className="text-xs italic text-foreground/40 text-center py-4">Henüz geçmiş bir etkinlik yok.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {pastEvents.slice(0, 5).map((e) => (
                  <div key={e.id} className="p-3 rounded-xl bg-foreground/5 border border-glass-border flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-foreground/75 truncate max-w-[150px]">{e.title}</p>
                      <p className="text-[10px] text-foreground/40">
                        {new Date(e.eventDate).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-foreground/40 italic">Geçti</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Upcoming Events List */}
        <div className="md:col-span-2 glass rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-black text-xl text-foreground">Yaklaşan Etkinliklerimiz</h2>
            <p className="text-xs text-foreground/50">İkinizin beraber yapacağı planlar ve heyecan verici tarihler.</p>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-glass-border rounded-2xl">
              <AlertCircle className="w-10 h-10 text-foreground/30 mx-auto mb-2" />
              <h4 className="font-bold text-sm">Hiç Plan Yok</h4>
              <p className="text-xs text-foreground/50 max-w-xs mx-auto">
                Yukarıdaki "Etkinlik Planla" butonuna tıklayarak ilk ortak takvim kaydınızı oluşturun.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((e) => {
                const days = getDaysRemaining(e.eventDate);
                return (
                  <div key={e.id} className="p-5 rounded-2xl bg-foreground/5 border border-glass-border flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-base text-foreground">{e.title}</h4>
                        {e.isRecurring && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            Yıllık Tekrar
                          </span>
                        )}
                      </div>
                      {e.description && <p className="text-xs text-foreground/75 leading-relaxed mb-2">{e.description}</p>}
                      <span className="text-[10px] text-foreground/50 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(e.eventDate).toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <span className="text-2xl font-black text-primary">{days}</span>
                      <span className="text-[10px] font-bold text-foreground/50">gün kaldı</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Add Event Modal */}
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
                  Yeni Etkinlik Kaydet <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-foreground/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Etkinlik Adı / Konu</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn. Yıldönümü Akşam Yemeği"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Açıklama</label>
                  <input
                    type="text"
                    placeholder="Detay veya mekan..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Tarih</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="recurring" className="text-xs font-semibold opacity-85 cursor-pointer">
                    Her yıl bu tarihte tekrarla (örn. Yıldönümü, Doğum günü)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm shadow-md cursor-pointer hover:bg-primary/95 transition-all mt-4"
                >
                  Takvime Ekle
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
