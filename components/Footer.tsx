"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MessageSquare } from "lucide-react";

const Youtube = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

function MagneticSocialIcon({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    if (distance < 40) {
      const ratio = distance / 40;
      const moveX = (distanceX / distance) * 6 * ratio;
      const moveY = (distanceY / distance) * 6 * ratio;
      x.set(moveX);
      y.set(moveY);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="p-3 border border-hairline bg-panel hover:bg-panel-raised text-text-muted hover:text-primary transition-colors flex items-center justify-center rounded-full"
    >
      {children}
    </motion.a>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-panel py-12 relative overflow-hidden">
      {/* Footer Background Asset with Low Opacity */}
      <div className="absolute inset-0 pointer-events-none opacity-15 mix-blend-screen -z-0">
        <Image
          src="/design_assets/footer_all section.jpeg"
          alt="Footer background texture"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand Monogram */}
          <div className="flex items-center">
            {/* Official Logo */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/images/logo/ravonixx_white.png"
                alt="RAVONIXX Logo"
                fill
                sizes="40px"
                className="object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              />
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-7 bg-white/20 mx-3" />

            <div className="text-left leading-none">
              <span className="display-font text-xl font-black text-text-primary tracking-wider uppercase slanted">RAVONIXX</span>
              <p className="text-text-muted text-[10px] font-body mt-1">Free Fire Esports Organization • EST. 2025</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link href="/" className="font-display text-sm text-text-muted hover:text-text-primary tracking-widest transition-colors">
              HOME
            </Link>
            <Link href="/team" className="font-display text-sm text-text-muted hover:text-text-primary tracking-widest transition-colors">
              ROSTER
            </Link>
            <Link href="/about" className="font-display text-sm text-text-muted hover:text-text-primary tracking-widest transition-colors">
              ABOUT
            </Link>
            <Link href="/contact" className="font-display text-sm text-text-muted hover:text-text-primary tracking-widest transition-colors">
              CONTACT
            </Link>
          </div>

          {/* Magnetic Social Icons */}
          <div className="flex items-center space-x-3">
            <MagneticSocialIcon href="https://www.youtube.com/@ravonixx-09">
              <Youtube className="w-5 h-5" />
            </MagneticSocialIcon>
            <MagneticSocialIcon href="https://www.instagram.com/ravonixx.ind">
              <Instagram className="w-5 h-5" />
            </MagneticSocialIcon>
            <MagneticSocialIcon href="https://www.linkedin.com/company/ravonixx">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </MagneticSocialIcon>
            <MagneticSocialIcon href="https://dsc.gg/ravonixx">
              <MessageSquare className="w-5 h-5" />
            </MagneticSocialIcon>
          </div>
        </div>

        {/* Official Affiliation & Sponsors Bar */}
        <div className="border-t border-hairline/50 mt-8 pt-6 flex flex-wrap items-center justify-between gap-4 opacity-75">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="relative w-28 h-7">
              <Image
                src="/images/ff logo/FREE_FIRE_MAX_LOGO.PNG.png"
                alt="Free Fire MAX"
                fill
                sizes="112px"
                className="object-contain"
              />
            </div>
            <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image
                  src="/images/sponsors/tz_esports_gold_cropped.png"
                  alt="TZ Esports"
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
              <span className="font-display font-bold text-[9px] text-white tracking-widest uppercase">TZ ESPORTS</span>
            </div>
            <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-5 flex-shrink-0">
                <Image
                  src="/images/sponsors/nx9_esports_purple_cropped.png"
                  alt="NX9 Esports"
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
              <span className="font-display font-bold text-[9px] text-white tracking-widest uppercase">NX9 ESPORTS</span>
            </div>
            <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image
                  src="/images/sponsors/rage_genesis_white.png"
                  alt="Rage Genesis"
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
              <span className="font-display font-bold text-[9px] text-white tracking-widest uppercase">RAGE GENESIS</span>
            </div>
            <div className="w-[1px] h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 flex-shrink-0 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                <Image
                  src="/images/sponsors/playora.png"
                  alt="Playora"
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
              <span className="font-display font-bold text-[9px] text-white tracking-widest uppercase">PLAYORA</span>
            </div>
          </div>
          <span className="font-display font-bold text-[9px] text-text-muted tracking-widest uppercase">
            OFFICIAL SPONSORS & PARTNERS
          </span>
        </div>

        <div className="border-t border-hairline mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-text-dim">
          <div>
            &copy; {currentYear} RAVONIXX. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/policy" className="hover:text-text-muted transition-colors">
              PRIVACY POLICY
            </Link>
            <Link href="/policy" className="hover:text-text-muted transition-colors">
              TERMS OF SERVICE
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
