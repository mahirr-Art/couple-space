"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Calendar, Compass, Sparkles, X, ChevronRight, Map, Heart } from "lucide-react";

// Preset romantic destinations for easy mocking/clicking
const PRESET_PLACES = [
  { name: "İstanbul", lat: 41.0082, lng: 28.9784, desc: "Boğaz'da gün batımı yürüyüşümüz." },
  { name: "Kapadokya", lat: 38.6431, lng: 34.8289, desc: "Balonların altında romantik kahvaltımız." },
  { name: "Antalya", lat: 36.8969, lng: 30.7133, desc: "Deniz kıyısındaki yaz tatilimiz." },
  { name: "İzmir", lat: 38.4192, lng: 27.1287, desc: "Kordon boyunda bisiklet turumuz." },
  { name: "Muğla / Fethiye", lat: 36.6218, lng: 29.1164, desc: "Ölüdeniz'de yamaç paraşütü heyecanımız." },
];

export default function MapPage() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [visitDate, setVisitDate] = useState("");

  const fetchPlaces = async () => {
    try {
      const res = await fetch("/api/map");
      if (res.ok) {
        const data = await res.json();
        setPlaces(data);
        if (data.length > 0) {
          setSelectedPlace(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lat || !lng) return;

    try {
      const res = await fetch("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          visitDate: visitDate || new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setLat("");
        setLng("");
        setVisitDate("");
        setShowAddModal(false);
        fetchPlaces();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_PLACES[0]) => {
    setName(preset.name);
    setDescription(preset.desc);
    setLat(preset.lat.toString());
    setLng(preset.lng.toString());
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
            Aşk Haritamız <MapPin className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Birlikte gittiğiniz yerleri haritada işaretleyin, seyahat anılarınızı tek bir noktada toplayın.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Konum Ekle</span>
        </button>
      </div>

      {/* Map Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: SVG Interactive Map Mockup */}
        <div className="md:col-span-2 glass rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[400px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              Birlikte Gezdiğimiz Rotalar <Map className="w-4 h-4 text-primary" />
            </h3>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {places.length} Konum İşaretli
            </span>
          </div>

          {/* Interactive Graphic Representation */}
          <div className="relative flex-1 bg-foreground/5 border border-glass-border rounded-2xl h-80 flex items-center justify-center p-4">
            {/* Draw a simulated geographic canvas containing glowing pins */}
            <svg viewBox="0 0 500 300" className="w-full h-full text-foreground/20">
              {/* Background abstract landmass shapes representing Turkey coastline */}
              <path
                d="M 50,150 Q 80,100 130,120 T 250,130 T 380,110 T 450,140 Q 420,190 350,200 T 200,210 T 80,180 Z"
                fill="currentColor"
                className="text-foreground/5 dark:text-foreground/10"
              />
              <path
                d="M 50,150 Q 150,170 300,160 T 450,140"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4"
                className="text-foreground/10"
              />
              
              {/* Connection lines between pins */}
              {places.length > 1 && (
                <path
                  d={`M ${places.map(p => {
                    // Map lat/lng roughly to coordinates on our SVG (Turkey: 36-42 Lat, 26-45 Lng)
                    const x = 50 + ((p.longitude - 26) / 19) * 400;
                    const y = 250 - ((p.latitude - 36) / 6) * 200;
                    return `${x},${y}`;
                  }).join(" L ")}`}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeDasharray="6"
                  className="animate-pulse"
                />
              )}

              {/* Highlighted Pins */}
              {places.map((place) => {
                const x = 50 + ((place.longitude - 26) / 19) * 400;
                const y = 250 - ((place.latitude - 36) / 6) * 200;
                const isSelected = selectedPlace?.id === place.id;

                return (
                  <g key={place.id} onClick={() => setSelectedPlace(place)} className="cursor-pointer">
                    <circle cx={x} cy={y} r={isSelected ? "14" : "8"} fill="var(--primary)" fillOpacity={isSelected ? "0.2" : "0.1"} className="animate-ping" style={{ animationDuration: "3s" }} />
                    <circle cx={x} cy={y} r={isSelected ? "8" : "5"} fill={isSelected ? "var(--primary)" : "var(--foreground)"} fillOpacity={isSelected ? "1" : "0.5"} />
                    <circle cx={x} cy={y} r="2" fill="white" />
                  </g>
                );
              })}
            </svg>

            {/* Float Info Box for Selected Pin */}
            {selectedPlace && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-4 left-4 right-4 p-4 rounded-xl glass border border-primary/20 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <MapPin className="w-4 h-4 fill-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">{selectedPlace.name}</h4>
                    <p className="text-[10px] text-foreground/60 line-clamp-1">{selectedPlace.description}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-foreground/40 shrink-0">
                  {new Date(selectedPlace.visitDate).toLocaleDateString("tr-TR")}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Side: List of Places */}
        <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-lg">Seyahat Defteri</h3>
            <p className="text-xs text-foreground/50">Birlikte gezilen tüm şehirler.</p>
          </div>

          {places.length === 0 ? (
            <p className="text-xs italic text-foreground/45 text-center py-8">Henüz seyahat kaydedilmemiş.</p>
          ) : (
            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-2">
              {places.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "glass border-glass-border hover:bg-foreground/5"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-primary fill-primary" : "text-foreground/50"}`} />
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{place.name}</h4>
                        <p className="text-[10px] text-foreground/60 leading-normal mt-0.5">{place.description}</p>
                      </div>
                    </div>
                    
                    <span className="text-[9px] font-semibold text-foreground/40 shrink-0 self-start mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(place.visitDate).toLocaleDateString("tr-TR", { month: "short", year: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Add Pin Modal */}
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
                  Gidilen Yer Ekle <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-foreground/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Fast Presets Tray */}
              <div className="mb-4">
                <label className="text-[10px] font-semibold opacity-60 block mb-2">Hızlı Şehir Seçimi:</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PLACES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="px-2.5 py-1.5 rounded-lg border border-glass-border hover:bg-foreground/5 text-[10px] font-semibold cursor-pointer text-foreground"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreatePlace} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Konum / Şehir Adı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn. Kapadokya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold opacity-70">Enlem (Latitude)</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      placeholder="Örn. 38.64"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold opacity-70">Boylam (Longitude)</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      placeholder="Örn. 34.82"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Seyahat Tarihi</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold opacity-70">Seyahat Notları</label>
                  <textarea
                    rows={3}
                    placeholder="Birlikte gittiğinizde neler yaptınız? Mekan önerileri..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-glass-border bg-background/50 text-foreground text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm shadow-md cursor-pointer hover:bg-primary/95 transition-all mt-4"
                >
                  Haritaya Ekle
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
