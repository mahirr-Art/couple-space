"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Heart, Shield, Star, Calendar, MessageSquare, Image as ImageIcon, BookOpen, Compass, Award } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const getDaysTogether = (dateStr: string) => {
    const start = new Date(dateStr);
    const today = new Date();
    const diff = today.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getRelationshipLevel = (days: number) => {
    if (days < 30) return { title: "Yeni Aşıklar 💖", desc: "Aşk taze, heyecan zirvede. Birlikte keşfedecek çok şeyiniz var!" };
    if (days < 100) return { title: "Uyumlu İkili 🌟", desc: "Birbirinizi tanıyor, harika anılar biriktiriyorsunuz." };
    if (days < 365) return { title: "Ayrılmaz Parçalar ✨", desc: "Güçlü bağlar oluşturdunuz, güven ve sevgi dolu bir bağ." };
    return { title: "Ruh İkizleri 👑", desc: "Birbirinizi tamamlıyorsunuz. Sonsuz bir uyum ve sevgi bağı!" };
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const daysTogether = data?.anniversaryDate ? getDaysTogether(data.anniversaryDate) : 0;
  const level = getRelationshipLevel(daysTogether);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
          Profil & İstatistikler <User className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          İlişkinizin gelişimini, istatistiklerini ve kazandığınız seviyeleri inceleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-extrabold text-3xl shadow-lg mb-4">
              {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
            
            <h2 className="text-xl font-extrabold text-foreground">{session?.user?.name}</h2>
            <p className="text-xs text-foreground/50 mt-1">{session?.user?.email}</p>

            <span className="text-[10px] font-bold px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full mt-4 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 fill-primary" /> Eşleşmiş Hesap
            </span>
          </div>

          <hr className="border-glass-border" />

          {/* Connection summary */}
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center text-foreground/75">
              <span>Partneriniz:</span>
              <span className="font-bold text-foreground">{data?.partner?.name || "Bulunamadı"}</span>
            </div>
            <div className="flex justify-between items-center text-foreground/75">
              <span>Birliktelik Kodu:</span>
              <span className="font-mono font-bold text-primary uppercase">{(session?.user as any)?.pairCode}</span>
            </div>
            <div className="flex justify-between items-center text-foreground/75">
              <span>Başlangıç Tarihi:</span>
              <span className="font-bold text-foreground">
                {data?.anniversaryDate 
                  ? new Date(data.anniversaryDate).toLocaleDateString("tr-TR") 
                  : "Belirlenmemiş"}
              </span>
            </div>
          </div>
        </div>

        {/* Level & Milestone widget */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Relationship Level Card */}
          <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-tr from-secondary/5 to-primary/5 border border-primary/15">
            <div className="absolute top-0 right-0 w-36 h-36 bg-secondary/10 rounded-full blur-3xl -z-10" />
            
            <div className="flex items-center space-x-3 text-secondary mb-4">
              <Award className="w-6 h-6 text-primary" />
              <span className="font-bold text-xs uppercase tracking-wider">İlişki Seviyeniz</span>
            </div>

            <h3 className="text-2xl font-black text-foreground mb-2">{level.title}</h3>
            <p className="text-xs text-foreground/70 leading-relaxed mb-6 max-w-md">{level.desc}</p>

            {/* Achievement details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-background/40 border border-glass-border">
                <span className="text-[10px] font-bold text-foreground/50 uppercase block">Birlikte Geçen Gün</span>
                <span className="text-3xl font-black text-primary mt-1 block">{daysTogether}</span>
              </div>
              <div className="p-4 rounded-2xl bg-background/40 border border-glass-border">
                <span className="text-[10px] font-bold text-foreground/50 uppercase block">Sonraki Aşama</span>
                <span className="text-xs font-bold text-foreground mt-2.5 block">
                  {daysTogether < 30 ? "30. gün (Uyumlu İkili)" : daysTogether < 100 ? "100. gün (Ayrılmaz Parçalar)" : daysTogether < 365 ? "365. gün (Ruh İkizleri)" : "En üst seviye!"}
                </span>
              </div>
            </div>
          </div>

          {/* Aggregate Activity Statistics Grid */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground/60 border-b border-glass-border pb-2">Aktivite İstatistiklerimiz</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Toplam Mesaj", value: data?.stats?.totalMessages || 0, icon: MessageSquare, color: "text-indigo-500 bg-indigo-500/10" },
                { label: "Kayıtlı Anı", value: data?.stats?.totalMemories || 0, icon: ImageIcon, color: "text-pink-500 bg-pink-500/10" },
                { label: "Günlük Notları", value: data?.stats?.totalJournalEntries || 0, icon: BookOpen, color: "text-purple-500 bg-purple-500/10" },
                { label: "Kova Listesi", value: `${data?.stats?.bucketList?.completed || 0}/${data?.stats?.bucketList?.total || 0}`, icon: Compass, color: "text-teal-500 bg-teal-500/10" },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="glass rounded-2xl p-4 flex flex-col justify-between min-h-[100px] border border-glass-border">
                    <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl font-black text-foreground block">{stat.value}</span>
                      <span className="text-[9px] font-bold text-foreground/45 uppercase block tracking-wider mt-0.5">{stat.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
