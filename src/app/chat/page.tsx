"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Image as ImageIcon,
  Mic,
  Smile,
  Paperclip,
  Trash,
  Play,
  Pause,
  AlertCircle,
  Heart
} from "lucide-react";

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Media uploads & audio states
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 3 seconds for messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    const payload = {
      content: content.trim(),
      mediaUrl,
      mediaType,
    };

    // Reset input fields immediately for snappy UI
    setContent("");
    setMediaUrl(null);
    setMediaType(null);
    setAudioUrl(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated Media Attachments
  const triggerImageUpload = () => {
    // Generate beautiful mock imagery so they see how it looks
    const mockImages = [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    ];
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
    setMediaUrl(randomImg);
    setMediaType("image");
  };

  // Audio Recording (Uses browser MediaRecorder API if permitted)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setMediaUrl(base64data);
          setMediaType("audio");
          setAudioUrl(URL.createObjectURL(audioBlob));
        };
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      // Fallback Mock audio if microphone permissions are denied or unavailable
      console.error("Microphone access denied, using simulated audio:", err);
      setIsRecording(true);
      setTimeout(() => {
        setMediaUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
        setMediaType("audio");
        setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
        setIsRecording(false);
      }, 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const EMOJIS = ["❤️", "💖", "😍", "😘", "🥰", "🌹", "✨", "😊", "😂", "😢", "🔥", "👍"];

  if (loading && messages.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto glass rounded-3xl overflow-hidden shadow-xl border border-glass-border">
      {/* Chat Header */}
      <div className="p-4 border-b border-glass-border flex items-center justify-between bg-foreground/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
            ❤️
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">Bizim Sohbetimiz</h2>
            <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Aktif
            </p>
          </div>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-foreground/40 space-y-2">
            <Heart className="w-8 h-8 text-primary/40 animate-pulse" />
            <p className="text-xs font-semibold">Henüz mesaj yok</p>
            <p className="text-[10px]">İlk mesajı yazarak sohbeti başlatın.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === session?.user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                  {/* Sender Name */}
                  <span className="text-[9px] font-semibold text-foreground/45 px-1">
                    {msg.sender.name}
                  </span>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${
                      isMe
                        ? "bg-gradient-to-tr from-primary to-pink-500 text-white rounded-br-none"
                        : "bg-foreground/5 border border-glass-border text-foreground rounded-bl-none"
                    }`}
                  >
                    {/* Media Attachments */}
                    {msg.mediaUrl && msg.mediaType === "image" && (
                      <img
                        src={msg.mediaUrl}
                        alt="Attached media"
                        className="rounded-xl max-w-full h-auto mb-2 object-cover max-h-60"
                      />
                    )}

                    {msg.mediaUrl && msg.mediaType === "audio" && (
                      <div className="flex items-center space-x-2 py-1">
                        <audio src={msg.mediaUrl} controls className="max-w-full h-8 text-xs outline-none" />
                      </div>
                    )}

                    {/* Text Content */}
                    {msg.content && <p className="leading-relaxed break-words">{msg.content}</p>}

                    {/* Timestamp */}
                    <span className={`text-[8px] block text-right mt-1.5 opacity-60`}>
                      {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment / Voice previews */}
      <AnimatePresence>
        {(mediaUrl || isRecording) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 border-t border-glass-border bg-foreground/5 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {isRecording ? (
                <div className="flex items-center space-x-2 text-red-500 animate-pulse text-xs font-semibold">
                  <Mic className="w-4 h-4" />
                  <span>Ses Kaydediliyor...</span>
                </div>
              ) : mediaType === "image" ? (
                <div className="flex items-center space-x-2">
                  <img src={mediaUrl!} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-glass-border" />
                  <span className="text-xs text-foreground/60">Fotoğraf Eklendi</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-primary" />
                  <span className="text-xs text-foreground/60">Ses Kaydı Eklendi</span>
                </div>
              )}
            </div>

            {!isRecording && (
              <button
                onClick={() => {
                  setMediaUrl(null);
                  setMediaType(null);
                  setAudioUrl(null);
                }}
                className="p-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer"
              >
                <Trash className="w-4 h-4" />
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold animate-pulse cursor-pointer"
              >
                Durdur
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Action Panel */}
      <div className="p-3 border-t border-glass-border bg-foreground/5 relative">
        {/* Emoji Selector Tray */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-16 left-4 glass p-2.5 rounded-2xl flex items-center space-x-2 shadow-lg border border-glass-border z-20"
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setContent((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl hover:scale-125 transition-all p-1 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="flex items-center space-x-2">
          {/* Add Emojis */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 rounded-xl hover:bg-foreground/5 text-foreground/60 hover:text-foreground cursor-pointer transition-all"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Add Image */}
          <button
            type="button"
            onClick={triggerImageUpload}
            className="p-2.5 rounded-xl hover:bg-foreground/5 text-foreground/60 hover:text-foreground cursor-pointer transition-all"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Record Audio */}
          <button
            type="button"
            onClick={startRecording}
            className="p-2.5 rounded-xl hover:bg-foreground/5 text-foreground/60 hover:text-foreground cursor-pointer transition-all"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-glass-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground"
          />

          <button
            type="submit"
            className="p-2.5 bg-primary text-white rounded-xl shadow-md hover:shadow-primary/20 transition-all cursor-pointer hover:bg-primary/95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
