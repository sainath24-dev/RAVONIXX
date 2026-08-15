"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, Send, CheckCircle2, Star, User } from "lucide-react";
import { fadeUp } from "@/lib/motion";

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1538130672835629076/A4YaYtDR8pB35OB7sS8r_WwL9F5VMn-xKr54ku3vGlPlpJI8az5n_7AbqhPdHoBIzq2a";

export interface CommunityFeedback {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  rating: number;
  text: string;
  date: string;
}

const AVATARS = [
  { name: "Kelly", url: "/character/kelly.jpeg" },
  { name: "Tatsuya", url: "/character/tatsuya.jpeg" },
  { name: "Kassie", url: "/character/kassie.jpeg" },
  { name: "Chrono", url: "/character/chrono.jpeg" },
  { name: "Moco", url: "/character/moco.jpeg" },
  { name: "Rafael", url: "/character/rafael.jpeg" },
  { name: "Maro", url: "/character/maro.jpeg" },
  { name: "Thiva", url: "/character/thiva.jpeg" },
];

export default function Testimonials() {
  const [feedbacks, setFeedbacks] = useState<CommunityFeedback[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Community Player");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Load permanent saved feedback from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ravonixx_player_feedback");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFeedbacks(parsed);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const newEntry: CommunityFeedback = {
      id: `fb_${Date.now()}`,
      name: name.trim(),
      role: role.trim() || "Community Member",
      avatarUrl: selectedAvatar,
      rating,
      text: message.trim(),
      date: "Just now",
    };

    // Save permanently to localStorage
    const updatedList = [newEntry, ...feedbacks];
    setFeedbacks(updatedList);
    try {
      localStorage.setItem("ravonixx_player_feedback", JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    // Send to Discord Webhook
    try {
      const payload = {
        username: "RAVONIXX Community Voice",
        embeds: [
          {
            title: "💬 New Player Feedback & Review",
            description: `**"${message.trim()}"**`,
            color: 16766720, // Gold / Purple
            fields: [
              { name: "👤 Player / Creator", value: name.trim(), inline: true },
              { name: "🏷️ Role", value: role.trim(), inline: true },
              { name: "⭐ Rating", value: `${"★".repeat(rating)} (${rating}/5)`, inline: true }
            ],
            footer: { text: "RAVONIXX Esports & Consultancy Community Wall" },
            timestamp: new Date().toISOString()
          }
        ]
      };

      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch {
      // ignore webhook failures
    }

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setName("");
    setMessage("");

    setTimeout(() => {
      setSubmitSuccess(false);
      setFormOpen(false);
    }, 2500);
  };

  const RatingStar = ({ filled }: { filled: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 fill-current ${filled ? "text-primary" : "text-hairline"}`}>
      <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5Z" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-8 w-full select-none">
      {/* Action Prompt Bar */}
      <div className="border border-hairline bg-panel p-6 rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="display-font font-bold text-sm text-text-primary uppercase tracking-wider">
              TELL US HOW YOU FEEL ABOUT RAVONIXX
            </h4>
            <p className="font-body text-xs text-text-muted">
              Share your thoughts, scrim experiences, and feedback. Your voice is displayed permanently below.
            </p>
          </div>
        </div>

        <button
          onClick={() => setFormOpen(!formOpen)}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hi text-black font-display font-black text-xs tracking-wider uppercase rounded-[2px] transition-all slanted shadow-[0_0_15px_rgba(168,85,247,0.35)] flex-shrink-0"
        >
          {formOpen ? "CLOSE FORM" : "WRITE YOUR REVIEW"}
        </button>
      </div>

      {/* Expandable Submission Form */}
      <AnimatePresence>
        {formOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="border border-primary/40 bg-panel-raised p-6 rounded-[2px] flex flex-col gap-5 overflow-hidden"
          >
            <h4 className="display-font font-bold text-xs tracking-widest text-primary uppercase">
              POST YOUR FEEDBACK & EXPERIENCE
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-1.5 font-bold">
                  YOUR NAME / IN-GAME NAME (IGN)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RVX-SHADOW / Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-void border border-hairline focus:border-primary text-xs font-body text-text-primary p-3 rounded-[2px] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-1.5 font-bold">
                  YOUR ROLE / TITLE
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-void border border-hairline focus:border-primary text-xs font-body text-text-primary p-3 rounded-[2px] outline-none transition-colors"
                >
                  <option value="Community Player">Community Player</option>
                  <option value="Scrim Partner">Scrim Partner</option>
                  <option value="Content Creator">Content Creator</option>
                  <option value="Tournament Competitor">Tournament Competitor</option>
                  <option value="Consultancy Client">Consultancy Client</option>
                  <option value="Fan / Supporter">Fan / Supporter</option>
                </select>
              </div>
            </div>

            {/* Avatar & Rating selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-1.5 font-bold">
                  SELECT AVATAR
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.name}
                      type="button"
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                        selectedAvatar === av.url ? "border-primary scale-110 shadow-[0_0_10px_rgba(168,85,247,0.8)]" : "border-hairline opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={av.url} alt={av.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-1.5 font-bold">
                  RATING ({rating}/5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-primary hover:scale-125 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? "fill-primary text-primary" : "text-hairline"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div>
              <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-1.5 font-bold">
                HOW DO YOU FEEL ABOUT RAVONIXX?
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tell the community how you feel about RAVONIXX..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-void border border-hairline focus:border-primary text-xs font-body text-text-primary p-3 rounded-[2px] outline-none resize-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hi text-black font-display font-black text-xs tracking-wider uppercase rounded-[2px] transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <>
                    SUBMIT TO COMMUNITY WALL <Send className="w-3.5 h-3.5 fill-current" />
                  </>
                )}
              </button>

              {submitSuccess && (
                <span className="text-xs text-primary font-display font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> POSTED PERMANENTLY!
                </span>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Community Voice Grid */}
      {feedbacks.length > 0 ? (
        <div className="columns-1 md:columns-2 gap-6 space-y-6 [column-fill:balance]">
          {feedbacks.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUp}
              className="break-inside-avoid border border-hairline bg-panel p-6 flex flex-col clip-card transition-colors duration-200 hover:bg-panel-raised"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <RatingStar key={s} filled={s <= item.rating} />
                ))}
              </div>

              {/* Review Text */}
              <p className="font-body text-xs text-text-primary leading-relaxed mb-6 italic">
                &ldquo;{item.text}&rdquo;
              </p>

              {/* User Info */}
              <div className="flex items-center justify-between mt-auto border-t border-hairline/50 pt-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full border border-primary/50 bg-panel-raised overflow-hidden">
                    <Image
                      src={item.avatarUrl || "/character/kelly.jpeg"}
                      alt={`${item.name} avatar`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-xs tracking-wider text-text-primary uppercase font-bold">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-body text-primary font-semibold">
                      {item.role}
                    </span>
                  </div>
                </div>
                <span className="font-display text-[9px] tracking-widest text-text-muted uppercase">
                  {item.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-hairline p-10 text-center rounded-[2px] bg-panel/30 flex flex-col items-center gap-2">
          <User className="w-8 h-8 text-text-muted mb-1" />
          <p className="font-display text-sm uppercase tracking-wider text-text-primary font-bold">
            NO REVIEWS POSTED YET
          </p>
          <p className="font-body text-xs text-text-muted max-w-md">
            Be the first operator, scrim partner, or community member to tell us how you feel about RAVONIXX above!
          </p>
        </div>
      )}
    </div>
  );
}
