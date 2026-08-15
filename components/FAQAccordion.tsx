"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

function AccordionItem({ question, answer, isOpen, onToggle }: FAQItem & { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-hairline bg-panel mb-3 clip-card-sm overflow-hidden select-none">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="font-display text-sm tracking-wider text-text-primary uppercase">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-text-muted"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 pt-0 border-t border-hairline/30">
          <p className="font-body text-xs text-text-muted leading-relaxed mt-4">
            {answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I apply for the RAVONIXX competitive squad?",
      answer: "You can submit an application via our Contact page or join our Discord server. Select candidates must have finished in the Heroic or Grandmaster tier in the current competitive season.",
    },
    {
      question: "Where do I inspect specific player sensitivity and claw configs?",
      answer: "All configuration details are fully public. Open the Roster page and click on any player's Battle Card to view their full dossier, containing sensitivity dials and custom HUD diagrams.",
    },
    {
      question: "Are scrims and coaching rooms open to external teams?",
      answer: "Yes, we coordinate open scrim sessions and professional VOD reviews. Check our Scrims & Coaching schedule or request server slots directly from the Contact page.",
    },
    {
      question: "What hardware spec rules are enforced on active players?",
      answer: "Our players train exclusively on mobile hardware specifications (emulators, tablet grids, and physical trigger attachments are strictly prohibited during official tournaments).",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}
