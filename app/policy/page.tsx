"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Shield, ArrowUp, FileText, CheckCircle2 } from "lucide-react";

interface PolicySection {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

const policySections: PolicySection[] = [
  {
    id: "purpose",
    number: "01",
    title: "1. Purpose",
    content: (
      <div className="space-y-3">
        <p>
          These policies establish the standards, responsibilities, expectations, and rules applicable to everyone associated with RAVONIXX, including employees, interns, players, creators, managers, staff members, contractors, clients, partners, and event participants.
        </p>
        <p>
          RAVONIXX is committed to maintaining a professional, respectful, competitive, transparent, and safe environment across its esports and consultancy operations.
        </p>
      </div>
    )
  },
  {
    id: "scope",
    number: "02",
    title: "2. Scope",
    content: (
      <div className="space-y-3">
        <p>These policies apply to:</p>
        <ul className="list-disc list-inside space-y-1 text-text-muted">
          <li>Esports players and competitive rosters</li>
          <li>Coaches, analysts and team managers</li>
          <li>Content creators and streamers</li>
          <li>Moderators and community staff</li>
          <li>Interns and employees</li>
          <li>Consultants and contractors</li>
          <li>Clients and business partners</li>
          <li>Tournament participants and organizers</li>
          <li>Sponsors and collaborators</li>
          <li>Anyone officially representing RAVONIXX</li>
        </ul>
        <p className="pt-2">
          These rules apply to both <strong className="text-text-primary">online and offline activities</strong>, including Discord, social media, tournaments, events, meetings, client communications, and public appearances.
        </p>
      </div>
    )
  },
  {
    id: "professional-conduct",
    number: "03",
    title: "3. Professional Conduct",
    content: (
      <div className="space-y-3">
        <p>Every member is expected to:</p>
        <ul className="list-disc list-inside space-y-1 text-text-muted">
          <li>Treat others with respect and professionalism.</li>
          <li>Communicate clearly and responsibly.</li>
          <li>Follow legitimate instructions from authorized management.</li>
          <li>Protect the reputation of RAVONIXX.</li>
          <li>Maintain professional behavior during public and private organizational activities.</li>
          <li>Avoid unnecessary conflicts and harassment.</li>
          <li>Take responsibility for their actions.</li>
          <li>Cooperate with internal investigations when reasonably required.</li>
        </ul>
        <p className="text-primary font-semibold pt-2">
          Disrespect, intimidation, harassment, discrimination, threats, or deliberate disruption of organizational activities may result in disciplinary action.
        </p>
      </div>
    )
  },
  {
    id: "code-of-conduct",
    number: "04",
    title: "4. Code of Conduct",
    content: (
      <div className="space-y-3">
        <p>RAVONIXX has a zero-tolerance approach toward:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-muted bg-void/50 p-4 border border-hairline rounded-[2px]">
          <div>• Harassment & Bullying</div>
          <div>• Threats & Hate speech</div>
          <div>• Discrimination & Sexual harassment</div>
          <div>• Doxxing & Extortion</div>
          <div>• Blackmail & Fraud</div>
          <div>• Impersonation & Misinformation</div>
          <div>• Unauthorized access to accounts or systems</div>
          <div>• Malicious activity against the org or its members</div>
        </div>
        <p>
          Members must not use their position within RAVONIXX to exploit, threaten, manipulate, or improperly influence another member.
        </p>
      </div>
    )
  },
  {
    id: "player-rules",
    number: "05",
    title: "5. Esports Player Rules",
    content: (
      <div className="space-y-3">
        <p>Players representing RAVONIXX must:</p>
        <ol className="list-decimal list-inside space-y-1.5 text-text-muted">
          <li>Maintain professional behavior during matches and tournaments.</li>
          <li>Follow tournament rules and organizer instructions.</li>
          <li>Avoid cheating, exploiting bugs, hacking, scripting, or unauthorized software.</li>
          <li>Never intentionally manipulate match results.</li>
          <li>Avoid match-fixing, betting on their own matches, or sharing confidential competitive information.</li>
          <li>Attend scheduled practices, scrims, tournaments, and team meetings.</li>
          <li>Inform management when they are unable to attend scheduled activities.</li>
          <li>Respect teammates, opponents, referees, organizers, and tournament staff.</li>
          <li>Wear/use approved organizational branding when officially representing RAVONIXX.</li>
          <li>Avoid making unauthorized statements on behalf of RAVONIXX.</li>
        </ol>
        <p className="text-amber-400/90 text-xs">
          Repeated absence, poor conduct, or failure to meet agreed competitive responsibilities may result in suspension or removal from the roster.
        </p>
      </div>
    )
  },
  {
    id: "anti-cheating",
    number: "06",
    title: "6. Anti-Cheating & Competitive Integrity",
    content: (
      <div className="space-y-3">
        <p>RAVONIXX strictly prohibits:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-text-muted">
          <span>• Hacks & Cheats</span>
          <span>• Scripts & Macros</span>
          <span>• Map/Bug Exploits</span>
          <span>• Unauthorized Mods</span>
          <span>• Account Sharing</span>
          <span>• Match Fixing</span>
          <span>• Team Collusion</span>
          <span>• Intentional Throwing</span>
          <span>• Result Manipulation</span>
        </div>
        <p>
          Any suspected violation may be investigated. Where appropriate, RAVONIXX may cooperate with tournament organizers, game publishers (Garena), or relevant authorities regarding serious competitive-integrity violations.
        </p>
      </div>
    )
  },
  {
    id: "content-creator",
    number: "07",
    title: "7. Content Creator & Social Media Policy",
    content: (
      <div className="space-y-3">
        <p>
          Creators and representatives may express their personal opinions but must not falsely represent personal opinions as official RAVONIXX statements.
        </p>
        <p>Members must not:</p>
        <ul className="list-disc list-inside space-y-1 text-text-muted">
          <li>Publish confidential organizational information.</li>
          <li>Reveal private client information.</li>
          <li>Publish internal conversations without authorization.</li>
          <li>Misrepresent sponsorships or partnerships.</li>
          <li>Use RAVONIXX branding to promote unauthorized activities.</li>
          <li>Make defamatory or knowingly false statements on behalf of the organization.</li>
          <li>Create content that intentionally damages organizational relationships.</li>
        </ul>
        <p>Official announcements should only be made through authorized channels or personnel.</p>
      </div>
    )
  },
  {
    id: "confidentiality",
    number: "08",
    title: "8. Confidentiality",
    content: (
      <div className="space-y-3">
        <p>Confidential information must be protected. Examples include:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-muted">
          <div>• Client & Contract data</div>
          <div>• Financials & Sponsorship talks</div>
          <div>• Internal docs & Player files</div>
          <div>• Passwords & Credentials</div>
          <div>• Tournament strats & VODs</div>
          <div>• Unreleased announcements</div>
          <div>• Source code & technical info</div>
          <div>• Strategic business plans</div>
        </div>
        <p className="text-text-muted text-xs">
          Confidential information must not be disclosed to unauthorized individuals without permission. This obligation may continue even after association with RAVONIXX ends.
        </p>
      </div>
    )
  },
  {
    id: "data-security",
    number: "09",
    title: "9. Data & Account Security",
    content: (
      <div className="space-y-3">
        <p>Members must:</p>
        <ul className="list-disc list-inside space-y-1 text-text-muted">
          <li>Keep organizational credentials secure and never share passwords unnecessarily.</li>
          <li>Use authorized accounts and systems.</li>
          <li>Report compromised accounts immediately to active management.</li>
          <li>Avoid downloading suspicious files onto organizational systems.</li>
          <li>Never attempt unauthorized access to organizational infrastructure.</li>
        </ul>
      </div>
    )
  },
  {
    id: "consultancy",
    number: "10",
    title: "10. Consultancy & Client Policy",
    content: (
      <div className="space-y-3">
        <p>RAVONIXX consultancy personnel must provide services professionally and honestly.</p>
        <ul className="list-disc list-inside space-y-1 text-text-muted">
          <li>Clearly understand the agreed scope of work and communicate timelines honestly.</li>
          <li>Protect client confidentiality and disclose relevant conflicts of interest.</li>
          <li>Avoid promising services that cannot reasonably be delivered.</li>
          <li>Deliver agreed work according to the applicable agreement.</li>
        </ul>
        <p className="text-text-muted text-xs">
          Clients must also provide accurate information, required materials, access, approvals, and payments necessary for the agreed service.
        </p>
      </div>
    )
  },
  {
    id: "financial-rules",
    number: "11",
    title: "11. Payments & Financial Rules",
    content: (
      <div className="space-y-3">
        <p>All financial transactions should be properly documented. RAVONIXX members must not:</p>
        <ul className="list-disc list-inside space-y-1 text-text-muted">
          <li>Misuse organizational funds or falsify financial records.</li>
          <li>Accept unauthorized payments or divert client/sponsorship funds.</li>
          <li>Use organizational funds for personal purposes without authorization.</li>
          <li>Create unauthorized financial commitments on behalf of RAVONIXX.</li>
        </ul>
      </div>
    )
  },
  {
    id: "sponsorships",
    number: "12",
    title: "12. Sponsorships & Partnerships",
    content: (
      <div className="space-y-3">
        <p>Only authorized representatives may negotiate or finalize official sponsorships and partnerships.</p>
        <ul className="list-disc list-inside space-y-1 text-text-muted">
          <li>Never promise sponsorship benefits without authorization.</li>
          <li>Never sign agreements on behalf of RAVONIXX without authority.</li>
          <li>Do not misrepresent organizational statistics or achievements.</li>
          <li>Do not accept conflicting sponsorships without approval.</li>
        </ul>
      </div>
    )
  },
  {
    id: "intellectual-property",
    number: "13",
    title: "13. Intellectual Property",
    content: (
      <div className="space-y-3">
        <p>
          RAVONIXX branding, logos, designs, websites, software, documents, media assets, and other organizational materials must not be used for unauthorized commercial purposes.
        </p>
      </div>
    )
  },
  {
    id: "conflict-of-interest",
    number: "14",
    title: "14. Conflict of Interest",
    content: (
      <div className="space-y-3">
        <p>Members must disclose situations where personal interests could conflict with their responsibilities to RAVONIXX (e.g. working directly with a competing organization or directing org opportunities toward personal entities).</p>
      </div>
    )
  },
  {
    id: "attendance",
    number: "15",
    title: "15. Attendance & Responsibilities",
    content: (
      <div className="space-y-3">
        <p>Employees, interns, staff, players, and team members are expected to fulfill their agreed responsibilities. Repeated unexplained absence, missed deadlines, or neglect of assigned duties may result in warnings or suspension.</p>
      </div>
    )
  },
  {
    id: "internal-communication",
    number: "16",
    title: "16. Internal Communication",
    content: (
      <div className="space-y-3">
        <p>Official organizational communication should remain professional. Members should use designated channels for management, team operations, scrim coordination, and technical support.</p>
      </div>
    )
  },
  {
    id: "recruitment",
    number: "17",
    title: "17. Recruitment & Representation",
    content: (
      <div className="space-y-3">
        <p>Only authorized representatives may officially recruit personnel or announce organizational appointments. No member may collect unauthorized recruitment fees or issue fake credentials.</p>
      </div>
    )
  },
  {
    id: "tournament-rules",
    number: "18",
    title: "18. Tournament Rules",
    content: (
      <div className="space-y-3">
        <p>For tournaments organized or operated by RAVONIXX:</p>
        <ul className="list-disc list-inside space-y-1 text-text-muted">
          <li>Participants must follow published tournament rules with accurate registration info.</li>
          <li>Teams must use eligible players; cheating and match manipulation are prohibited.</li>
          <li>Tournament administrators&apos; decisions must be respected.</li>
          <li>Prize distribution will follow the published tournament terms.</li>
        </ul>
      </div>
    )
  },
  {
    id: "disciplinary-policy",
    number: "19",
    title: "19. Disciplinary Policy",
    content: (
      <div className="space-y-3">
        <p>Depending on the severity of a violation, RAVONIXX may take one or more of the following actions:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-panel border border-hairline">
            <strong className="text-primary block">Level 1 — Verbal Warning</strong>
            <span className="text-text-muted">For minor or first-time issues.</span>
          </div>
          <div className="p-3 bg-panel border border-hairline">
            <strong className="text-primary block">Level 2 — Written Warning</strong>
            <span className="text-text-muted">For repeated or more serious violations.</span>
          </div>
          <div className="p-3 bg-panel border border-hairline">
            <strong className="text-amber-400 block">Level 3 — Suspension</strong>
            <span className="text-text-muted">Temporary removal from activities/teams.</span>
          </div>
          <div className="p-3 bg-panel border border-hairline">
            <strong className="text-red-400 block">Level 4 — Removal</strong>
            <span className="text-text-muted">Permanent removal from roster or staff role.</span>
          </div>
          <div className="p-3 bg-panel border border-hairline">
            <strong className="text-red-500 block">Level 5 — Termination</strong>
            <span className="text-text-muted">Ending employment or formal association.</span>
          </div>
          <div className="p-3 bg-panel border border-hairline">
            <strong className="text-red-600 block">Level 6 — External Action</strong>
            <span className="text-text-muted">Legal/authority remedies for fraud or hacking.</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "investigation",
    number: "20",
    title: "20. Investigation Process",
    content: (
      <div className="space-y-3">
        <p>Where a serious violation is alleged, RAVONIXX will document the complaint, review evidence, allow relevant parties to provide their explanation, and determine an outcome confidentially.</p>
      </div>
    )
  },
  {
    id: "appeals",
    number: "21",
    title: "21. Appeals",
    content: (
      <div className="space-y-3">
        <p>A person subject to disciplinary action may request a review of the decision within a reasonable period, explaining the challenged decision and submitting relevant evidence.</p>
      </div>
    )
  },
  {
    id: "brand-use",
    number: "22",
    title: "22. Use of Organizational Branding",
    content: (
      <div className="space-y-3">
        <p>RAVONIXX logos, names, uniforms, and graphics may only be used in accordance with organizational guidelines. Former members may not present themselves as current representatives.</p>
      </div>
    )
  },
  {
    id: "public-statements",
    number: "23",
    title: "23. Public Statements",
    content: (
      <div className="space-y-3">
        <p>Only authorized representatives may issue official statements regarding legal matters, partnerships, sponsorships, roster transfers, or financial matters.</p>
      </div>
    )
  },
  {
    id: "anti-fraud",
    number: "24",
    title: "24. Anti-Fraud Policy",
    content: (
      <div className="space-y-3">
        <p>RAVONIXX strictly prohibits fake invoices, false payment claims, fraudulent documents, misrepresentation of services, or unauthorized fundraising.</p>
      </div>
    )
  },
  {
    id: "professional-relationships",
    number: "25",
    title: "25. Professional Relationships",
    content: (
      <div className="space-y-3">
        <p>Members should maintain appropriate professional boundaries. Personal disagreements should not interfere with organizational responsibilities.</p>
      </div>
    )
  },
  {
    id: "resignation",
    number: "26",
    title: "26. Resignation & Departure",
    content: (
      <div className="space-y-3">
        <p>When leaving RAVONIXX, members must return organizational property, transfer files, remove credentials, and complete contractual obligations.</p>
      </div>
    )
  },
  {
    id: "policy-changes",
    number: "27",
    title: "27. Policy Changes",
    content: (
      <div className="space-y-3">
        <p>RAVONIXX may update these policies to reflect organizational growth, tournament mandates, security needs, or legal requirements. Updates will be published on official channels.</p>
      </div>
    )
  },
  {
    id: "acceptance",
    number: "28",
    title: "28. Acceptance & Final Statement",
    content: (
      <div className="space-y-4">
        <p>
          By joining, working with, representing, or participating in RAVONIXX activities, individuals acknowledge and agree to comply with the policies applicable to their role.
        </p>
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-[2px]">
          <h4 className="display-font text-sm text-primary font-black uppercase tracking-wider mb-2">
            Final Statement
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            RAVONIXX aims to build an organization based on <strong>professionalism, integrity, competition, innovation, accountability, and respect</strong>. Every person representing RAVONIXX contributes to its reputation.
          </p>
          <div className="mt-3 pt-3 border-t border-primary/20 flex items-center justify-between text-[11px] font-display">
            <span className="text-white font-bold tracking-widest">RAVONIXX — ESPORTS & CONSULTANCY</span>
            <span className="text-primary italic">Professional. Competitive. Reliable.</span>
          </div>
        </div>
      </div>
    )
  }
];

export default function PolicyPage() {
  const [activeSectionId, setActiveSectionId] = useState("purpose");
  const [searchFilter, setSearchFilter] = useState("");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const filteredSections = policySections.filter(sec => 
    sec.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    sec.id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    policySections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      {/* Header Banner */}
      <div className="relative border border-hairline bg-panel p-8 sm:p-12 mb-12 rounded-[2px] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-0">
          <Image
            src="/design_assets/randomdesign5.jpeg"
            alt="Policy backdrop"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-display font-bold tracking-widest uppercase mb-2">
              <Shield className="w-4 h-4" />
              OFFICIAL RULEBOOK & CODE OF CONDUCT
            </div>
            <h1 className="display-font text-3xl sm:text-5xl font-black text-text-primary tracking-wide uppercase slanted">
              RAVONIXX POLICIES
            </h1>
            <p className="font-body text-xs sm:text-sm text-text-muted mt-2 max-w-2xl">
              Esports & Consultancy — Effective Date: 15 August 2026 • Organization: RAVONIXX (ravonixx.xyz)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-primary hover:bg-primary-hi text-white font-display text-xs font-bold tracking-wider uppercase transition-colors slanted flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              AGREE & REGISTER
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Sidebar Navigation (4 cols) */}
        <div className="lg:col-span-4 sticky top-28 bg-panel border border-hairline p-5 rounded-[2px] flex flex-col gap-4 max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <span className="display-font text-xs tracking-widest text-text-primary uppercase font-bold flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              TABLE OF CONTENTS
            </span>
            <span className="text-[10px] text-text-muted font-display">28 SECTIONS</span>
          </div>

          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search policy rule..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-void border border-hairline focus:border-primary text-xs text-text-primary font-body rounded-[2px] outline-none transition-colors"
            />
          </div>

          {/* Scrollable list */}
          <div className="flex flex-col gap-1 overflow-y-auto pr-1">
            {filteredSections.map((section) => {
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`text-left px-3 py-2 text-xs font-display tracking-wider transition-all duration-150 flex items-center justify-between rounded-[2px] ${
                    isActive
                      ? "bg-primary/15 text-primary border-l-2 border-primary font-bold pl-2.5"
                      : "text-text-muted hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{section.title}</span>
                  <span className="text-[9px] opacity-60 ml-2 font-mono">{section.number}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {filteredSections.map((section) => (
            <article
              key={section.id}
              id={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              className="bg-panel border border-hairline p-6 sm:p-8 rounded-[2px] relative scroll-mt-28"
            >
              <div className="flex items-center justify-between border-b border-hairline pb-3 mb-4">
                <h2 className="display-font text-lg sm:text-xl font-bold text-text-primary tracking-wide uppercase">
                  {section.title}
                </h2>
                <span className="text-xs font-display text-primary font-bold tracking-widest">
                  #{section.number}
                </span>
              </div>
              <div className="font-body text-xs sm:text-sm text-text-muted leading-relaxed">
                {section.content}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3 bg-panel border border-hairline hover:border-primary text-text-muted hover:text-primary rounded-[2px] shadow-2xl transition-all duration-200 z-40 group"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
