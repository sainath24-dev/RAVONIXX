"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", path: "/" },
    { name: "Roster", path: "/team" },
    { name: "Tactics", path: "/strategy" },
    { name: "Tournaments", path: "/tournaments" },
    { name: "Esports", path: "/esports" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <nav
        onMouseEnter={() => setIsNavHovered(true)}
        onMouseLeave={() => setIsNavHovered(false)}
        className={`fixed top-0 left-0 w-full z-50 border-b transition-colors duration-200 backdrop-blur-md overflow-hidden ${
          scrolled
            ? "bg-[#0C0F12]/85 border-white/10 shadow-lg"
            : "bg-[#0C0F12]/50 border-white/5"
        }`}
      >
        {/* Subtle Low-Opacity Background Texture Asset */}
        <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-10">
          <Image
            src="/design_assets/navbar_rotated.jpeg"
            alt="Nav texture"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="w-full px-6 md:px-10">
          <div className="flex items-center justify-between h-[104px]">
            {/* Logo Group */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-white hover:text-primary transition-colors flex items-center group">
                {/* Official 3D Faceted Geometric R Emblem */}
                <motion.div
                  animate={isNavHovered ? {
                    scale: 1.08,
                    rotate: [0, -2, 2, 0],
                    filter: "drop-shadow(0 0 16px rgba(168, 85, 247, 0.85))",
                  } : {
                    scale: 1,
                    rotate: 0,
                    filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.35))",
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeOut" 
                  }}
                  className="relative w-12 h-12 flex-shrink-0"
                >
                  <Image
                    src="/images/logo/ravonixx_white.png"
                    alt="RAVONIXX Emblem"
                    fill
                    priority
                    sizes="48px"
                    className="object-contain"
                  />
                </motion.div>

                {/* Vertical Divider */}
                <div className="w-[1px] h-8 bg-white/20 mx-3" />

                {/* Brand Text Column */}
                <div className="flex flex-col items-start leading-none">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-2xl tracking-widest text-white uppercase slanted">
                      RAVONIXX
                    </span>
                    <div className="relative w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Image
                        src="/images/ff logo/FF_SHORT_LOGO.PNG.png"
                        alt="FF"
                        fill
                        sizes="16px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <span className="font-display font-bold text-[8px] tracking-[0.2em] text-primary mt-1">
                    EST. 2025 • FREE FIRE
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links - Widely spaced & clean */}
            <div className="hidden md:flex items-center space-x-12">
              {links.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`display-font text-xl md:text-2xl tracking-widest transition-colors relative py-2 ${
                      isActive ? "text-primary font-bold" : "text-text-muted hover:text-white"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 w-full h-[3px] bg-primary shadow-[0_0_12px_rgba(168,85,247,0.8)] animate-in fade-in duration-150"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Nav Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-text-muted hover:text-text-primary focus:outline-none"
                aria-label="Toggle Menu"
              >
                <div className="relative w-6 h-6">
                  <motion.div
                    animate={{ opacity: isOpen ? 0 : 1 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="md:hidden overflow-hidden bg-panel border-t border-hairline"
        >
          <div className="px-4 pt-2 pb-6 space-y-4">
            {links.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-3 font-display text-xl tracking-wider ${
                    isActive ? "text-primary" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </motion.div>
      </nav>
    </>
  );
}
