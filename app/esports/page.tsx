"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Search, Film } from "lucide-react";

const DEFAULT_VIDEOS = [
  {
    id: "F07S9rY1-oU",
    title: "FFWS SEA Spring | Grand Finals Champion Stage",
    channel: "Free Fire Esports Official",
    thumbnail: "https://img.youtube.com/vi/F07S9rY1-oU/hqdefault.jpg"
  },
  {
    id: "b4l-V4p5_pE",
    title: "FFWS SEA Spring | Knockout Stage - Week 4 Day 3",
    channel: "Free Fire Esports Official",
    thumbnail: "https://img.youtube.com/vi/b4l-V4p5_pE/hqdefault.jpg"
  },
  {
    id: "kYJ_L2kH0a4",
    title: "FFWS SEA Fall | Knockout Stage - Week 1 Day 1",
    channel: "Free Fire Esports Official",
    thumbnail: "https://img.youtube.com/vi/kYJ_L2kH0a4/hqdefault.jpg"
  },
  {
    id: "Qf2l5xJ_s0w",
    title: "Full Recap | FFWS Global Finals Tournament Highlights",
    channel: "Free Fire Official",
    thumbnail: "https://img.youtube.com/vi/Qf2l5xJ_s0w/hqdefault.jpg"
  },
  {
    id: "9oM23_vH3_k",
    title: "FFWS SEA Spring | Knockout Stage - Week 1 Day 1",
    channel: "Free Fire Esports Official",
    thumbnail: "https://img.youtube.com/vi/9oM23_vH3_k/hqdefault.jpg"
  }
];

const PRESET_TAGS = [
  { tag: "FFWS Finals", query: "FFWS Grand Finals Free Fire Esports Official" },
  { tag: "Knockout Stage", query: "FFWS Knockout Stage Free Fire Esports Official" },
  { tag: "SEA Championship", query: "FFWS SEA Free Fire Esports Official" },
  { tag: "Global Finals", query: "Free Fire World Series Global Finals Official" },
  { tag: "India Esports", query: "Free Fire India Championship Official" }
];

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
}

function decodeHtmlEntities(str: string) {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

interface YoutubeApiItem {
  id?: { videoId?: string } | string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
}

export default function EsportsPage() {
  const [activeVideoId, setActiveVideoId] = useState("");
  const [activeVideoTitle, setActiveVideoTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_VIDEOS);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const searchYouTube = useCallback(async (queryText: string) => {
    if (!queryText || !queryText.trim()) return;
    setLoading(true);
    setErrorText("");

    try {
      const url = `/api/youtube?q=${encodeURIComponent(queryText.trim())}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      
      const data = await res.json();
      if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
        const parsedVideos: VideoItem[] = (data.items as YoutubeApiItem[])
          .filter((item: YoutubeApiItem) => {
            const vid = typeof item?.id === "object" ? item?.id?.videoId : typeof item?.id === "string" ? item?.id : "";
            return Boolean(vid && item?.snippet?.title);
          })
          .map((item: YoutubeApiItem) => {
            const vid = typeof item?.id === "object" ? item?.id?.videoId : typeof item?.id === "string" ? item?.id : "";
            return {
              id: vid || "",
              title: decodeHtmlEntities(item?.snippet?.title || "Free Fire Esports Video"),
              channel: item?.snippet?.channelTitle || "Esports Channel",
              thumbnail: item?.snippet?.thumbnails?.medium?.url || item?.snippet?.thumbnails?.default?.url || "/character/tatsuya.jpeg"
            };
          });
        
        if (parsedVideos.length > 0) {
          setVideos(parsedVideos);
          setActiveVideoId(parsedVideos[0].id);
          setActiveVideoTitle(parsedVideos[0].title);
        } else {
          setErrorText("No matching videos found.");
        }
      } else {
        setErrorText("No results returned for this query.");
      }
    } catch {
      setErrorText("API limit reached or offline. Loading curated highlights.");
      setVideos(DEFAULT_VIDEOS);
      if (DEFAULT_VIDEOS.length > 0) {
        setActiveVideoId(DEFAULT_VIDEOS[0].id);
        setActiveVideoTitle(DEFAULT_VIDEOS[0].title);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically fetch live embeddable Free Fire videos on initial page mount
  React.useEffect(() => {
    searchYouTube("FFWS Grand Finals Free Fire Esports Official");
  }, [searchYouTube]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchYouTube(searchQuery);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8 select-none min-h-[85vh]">
      
      {/* Title with Free Fire Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 select-none overflow-hidden py-2 flex-shrink-0">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="display-font font-black italic tracking-wide text-4xl sm:text-6xl text-text-primary uppercase slanted leading-none flex items-center justify-center md:justify-start gap-1"
          >
            <span className="text-primary font-bold">/</span>ESPORTS VIDEOS
          </motion.h1>
          <p className="text-text-muted font-body text-xs sm:text-sm mt-3 uppercase tracking-wider">
            Browse Free Fire pro rotations, highlights, and grand finals broadcasts.
          </p>
        </div>

        {/* Free Fire MAX and Booyah Emblem Block */}
        <div className="flex items-center justify-center md:justify-end gap-4 p-3 bg-panel border border-hairline rounded">
          <div className="relative w-32 h-8">
            <Image
              src="/images/ff logo/FREE_FIRE_MAX_LOGO.PNG.png"
              alt="Free Fire MAX"
              fill
              sizes="128px"
              className="object-contain"
            />
          </div>
          <div className="w-[1px] h-6 bg-white/20" />
          <div className="relative w-8 h-8">
            <Image
              src="/images/ff logo/BOOYAH_ICON.PNG.png"
              alt="Booyah"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Side: Video Player (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full">
          
          {/* 16:9 Youtube Iframe Player */}
          <div className="relative aspect-video w-full bg-black border border-hairline overflow-hidden rounded-[2px] shadow-2xl">
            <iframe
              className="w-full h-full border-0 absolute inset-0 z-10"
              src={`https://www.youtube.com/embed/${activeVideoId || DEFAULT_VIDEOS[0].id}?autoplay=1&rel=0`}
              title="Esports video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Simple Video Info Banner */}
          <div className="relative bg-panel border border-hairline p-6 rounded-[2px] overflow-hidden">
            {/* Subtle Texture Asset with Low Opacity */}
            <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-0">
              <Image
                src="/design_assets/randomdesign2.jpeg"
                alt="Banner texture"
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover object-center"
              />
            </div>

            <div className="relative z-10 flex items-center gap-2 mb-2 text-primary font-display font-bold text-[10px] tracking-widest uppercase">
              <Film className="w-3.5 h-3.5" />
              NOW PLAYING
            </div>
            <h2 className="relative z-10 display-font font-black italic uppercase text-lg sm:text-2xl text-text-primary tracking-wide leading-snug">
              {activeVideoTitle || "Free Fire Pro Highlights"}
            </h2>
          </div>
        </div>

        {/* Right Side: Search & Playlists Sidebar (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          
          {/* Streamlined Search Console */}
          <div className="bg-panel border border-hairline p-5 rounded-[2px] flex flex-col gap-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search matches & rotations..."
                  className="w-full bg-panel-raised border border-hairline p-3 pl-10 text-xs font-body text-text-primary focus:outline-none focus:border-primary rounded-[2px]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-4 bg-primary hover:bg-primary-hi text-black text-xs font-display font-bold uppercase rounded-[2px] transition-colors disabled:opacity-50"
              >
                {loading ? "SEARCHING..." : "SEARCH"}
              </button>
            </form>

            {/* Presets tags */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-hairline/40">
              {PRESET_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(tag.query);
                    searchYouTube(tag.query);
                  }}
                  className="py-1 px-2.5 bg-panel-raised border border-hairline hover:border-primary text-[9px] font-display font-bold tracking-wider uppercase text-text-muted hover:text-primary rounded-[2px] transition-colors"
                >
                  {tag.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Video List Grid */}
          <div className="flex flex-col gap-3">
            <span className="display-font text-[10px] tracking-widest text-text-muted font-bold block uppercase border-b border-hairline pb-2">
              RECOMMENDED VIDEOS
            </span>

            {errorText && (
              <span className="text-[9px] font-body text-text-muted uppercase">
                {errorText}
              </span>
            )}

            <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {videos.map((item, idx) => (
                  <motion.button
                    key={`${item.id || idx}-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    onClick={() => {
                      if (item.id) {
                        setActiveVideoId(item.id);
                        setActiveVideoTitle(item.title);
                      }
                    }}
                    className={`group text-left p-2.5 border transition-all duration-200 flex gap-3 rounded-[2px] focus:outline-none relative overflow-hidden ${
                      activeVideoId === item.id 
                        ? "border-primary bg-primary/5" 
                        : "border-hairline bg-panel-raised/35 hover:border-text-muted"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-12 bg-black rounded-[2px] overflow-hidden flex-shrink-0 border border-hairline/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.src = "/character/tatsuya.jpeg";
                        }}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 fill-primary text-primary" />
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="flex flex-col justify-between overflow-hidden flex-grow">
                      <div>
                        <h4 className="display-font text-[9.5px] font-black italic tracking-wide text-text-primary group-hover:text-primary transition-colors uppercase leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="text-[8px] font-body text-text-muted mt-1 block truncate">
                          {item.channel}
                        </span>
                      </div>
                    </div>

                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
