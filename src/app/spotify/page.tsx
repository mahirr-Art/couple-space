"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Play, Pause, Plus, RefreshCw, Sparkles, ExternalLink } from "lucide-react";

export default function SpotifyPage() {
  const [data, setData] = useState<any>(null);
  const [playlistInput, setPlaylistInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchCoupleData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d.sharedPlaylistUrl) {
          setPlaylistInput(d.sharedPlaylistUrl);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupleData();
  }, []);

  const handleUpdatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/couple", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharedPlaylistUrl: playlistInput }),
      });
      if (res.ok) {
        fetchCoupleData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to convert Spotify standard URL to Embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      // e.g., https://open.spotify.com/playlist/37i9dQZF1DXcBWIGsy7275?si=...
      const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        return `https://open.spotify.com/embed/playlist/${match[1]}?utm_source=generator`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const embedUrl = getEmbedUrl(data?.sharedPlaylistUrl || "");

  // Mock Dynamic Tracks playing right now (feels extremely alive!)
  const myTrack = {
    title: "Perfect",
    artist: "Ed Sheeran",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=150",
  };

  const partnerTrack = {
    title: "Yellow",
    artist: "Coldplay",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=150",
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          Spotify Müzik Kutusu <Music className="w-6 h-6 text-green-500" />
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          Ortak çalma listenizi dinleyin ve partnerinizin şu anda dinlediği parçaları keşfedin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Dynamic Tracks Section */}
        <div className="md:col-span-1 space-y-6">
          
          {/* My dynamic status */}
          <div className="glass rounded-3xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">Sizin Dinlediğiniz</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden relative group">
                <img src={myTrack.cover} alt="Cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-foreground truncate">{myTrack.title}</h4>
                <p className="text-xs text-foreground/60 truncate">{myTrack.artist}</p>
                <div className="flex items-center space-x-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  <span className="text-[10px] text-green-500 font-semibold">Aktif Dinleme</span>
                </div>
              </div>
            </div>
          </div>

          {/* Partner's dynamic status */}
          <div className="glass rounded-3xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">
              {data?.partner?.name || "Partnerinizin"} Dinlediği
            </h3>
            {data?.partner ? (
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden relative">
                  <img src={partnerTrack.cover} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground truncate">{partnerTrack.title}</h4>
                  <p className="text-xs text-foreground/60 truncate">{partnerTrack.artist}</p>
                  <div className="flex items-center space-x-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    <span className="text-[10px] text-green-500 font-semibold">Şu an aktif</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs italic text-foreground/50">Partner bulunamadı.</p>
            )}
          </div>
        </div>

        {/* Playlist Integration Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                Ortak Çalma Listesi <Sparkles className="w-4 h-4 text-green-500" />
              </h3>
              <p className="text-xs text-foreground/60">
                Aşağıya ortak çalma listenizin Spotify linkini ekleyin ve doğrudan buradan dinleyin.
              </p>
            </div>

            <form onSubmit={handleUpdatePlaylist} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Örn. https://open.spotify.com/playlist/..."
                value={playlistInput}
                onChange={(e) => setPlaylistInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-glass-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 text-sm"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Kaydet</span>
              </button>
            </form>

            {embedUrl ? (
              <div className="rounded-2xl overflow-hidden border border-glass-border shadow-inner bg-black/5">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="380"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-2xl"
                />
              </div>
            ) : (
              <div className="py-12 border border-dashed border-glass-border rounded-2xl text-center space-y-3">
                <Music className="w-10 h-10 text-foreground/30 mx-auto" />
                <h4 className="font-bold text-sm">Çalma Listesi Eklenmedi</h4>
                <p className="text-xs text-foreground/50 max-w-xs mx-auto">
                  Ortak çalma listenizin bağlantısını yukarıdaki alana girerek kaydet tuşuna basın.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
