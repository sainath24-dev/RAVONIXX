"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, ChevronDown, Check, User, Globe, FileText, ArrowRight, ArrowLeft, Mail, ExternalLink, ShieldCheck } from "lucide-react";
import { fadeUp } from "@/lib/motion";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ign: z.string().min(2, "IGN must be at least 2 characters"),
  uid: z.string().min(6, "UID must be at least 6 digits"),
  email: z.string().email("Please provide a valid email address"),
  discord: z.string().min(2, "Discord handle is required"),
  region: z.string().min(1, "Please select your region"),
  tier: z.string().min(1, "Please select your division tier"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the RAVONIXX Policies and Code of Conduct",
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTierOpen, setIsTierOpen] = useState(false);

  const regions = ["India / South Asia", "Southeast Asia (SEA)", "Middle East & North Africa", "Europe", "North America", "LATAM / Brazil"];
  const tiers = ["Grandmaster Tier", "Heroic Tier", "Tier 1 Competitive Scrims", "Tier 2 / Challenger", "Community / Casual"];

  const {
    register,
    handleSubmit,
    control,
    trigger,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      ign: "",
      uid: "",
      email: "",
      discord: "",
      region: "India / South Asia",
      tier: "Grandmaster Tier",
      message: "",
      agreeTerms: false,
    },
  });

  const agreeTermsValue = watch("agreeTerms");

  const nextStep = async () => {
    if (currentStep === 1) {
      const valid = await trigger(["name", "ign", "uid"]);
      if (valid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const valid = await trigger(["email", "discord", "region", "tier"]);
      if (valid) setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    setFormStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setFormStatus("success");
      reset();
    } catch {
      setFormStatus("success");
      reset();
    }
  };

  const stepsList = [
    { num: 1, label: "OPERATOR INFO", icon: User },
    { num: 2, label: "REGION & TIER", icon: Globe },
    { num: 3, label: "TERMS & CONFIRM", icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col select-none min-h-[85vh]">
      {/* Split Layout Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full"
      >
        {/* Left Column: Multi-Step Registration Form */}
        <div className="relative lg:col-span-7 border border-hairline bg-panel p-6 sm:p-8 clip-card overflow-hidden shadow-2xl">
          {/* Background Texture Asset */}
          <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-0">
            <Image
              src="/design_assets/randomdesign5.jpeg"
              alt="Form backdrop"
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover object-center"
            />
          </div>

          <div className="relative z-10 flex flex-col gap-8">
            
            {/* Top Stepper Indicator */}
            <div className="relative flex items-center justify-between pb-6 border-b border-hairline">
              {/* Connecting Progress Line */}
              <div className="absolute top-5 left-8 right-8 h-[2px] bg-hairline z-0">
                <motion.div
                  animate={{
                    width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="h-full bg-primary shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                />
              </div>

              {stepsList.map((step) => {
                const isCompleted = currentStep > step.num;
                const isCurrent = currentStep === step.num;
                const IconComponent = step.icon;

                return (
                  <div key={step.num} className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 font-display font-black text-xs ${
                        isCompleted
                          ? "bg-primary border-primary text-black"
                          : isCurrent
                          ? "bg-panel-raised border-primary text-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                          : "bg-panel border-hairline text-text-muted"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : <IconComponent className="w-4 h-4" />}
                    </div>
                    <span
                      className={`font-display text-[9px] tracking-wider uppercase ${
                        isCurrent ? "text-white font-bold" : "text-text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <AnimatePresence mode="wait">
                {/* STEP 1: Operator Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex items-center gap-2 text-xs font-display text-primary tracking-wider uppercase font-bold">
                      <span>STEP 01 // OPERATOR CREDENTIALS</span>
                    </div>

                    <div>
                      <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-2 font-bold">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ALEX CHEN"
                        {...register("name")}
                        className="w-full bg-panel-raised border border-hairline focus:border-primary text-xs font-body text-text-primary p-3.5 rounded-[2px] focus:outline-none transition-colors"
                      />
                      {errors.name && (
                        <p className="text-[10px] font-body text-primary mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-2 font-bold">
                          FREE FIRE IGN
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. RVX-VIPER"
                          {...register("ign")}
                          className="w-full bg-panel-raised border border-hairline focus:border-primary text-xs font-body text-text-primary p-3.5 rounded-[2px] focus:outline-none transition-colors"
                        />
                        {errors.ign && (
                          <p className="text-[10px] font-body text-primary mt-1">{errors.ign.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-2 font-bold">
                          ACCOUNT UID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 561691696"
                          {...register("uid")}
                          className="w-full bg-panel-raised border border-hairline focus:border-primary text-xs font-body text-text-primary p-3.5 rounded-[2px] focus:outline-none transition-colors"
                        />
                        {errors.uid && (
                          <p className="text-[10px] font-body text-primary mt-1">{errors.uid.message}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Platform & Region */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex items-center gap-2 text-xs font-display text-primary tracking-wider uppercase font-bold">
                      <span>STEP 02 // REGION & DIVISION TIER</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-2 font-bold">
                          EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. ALEX@GMAIL.COM"
                          {...register("email")}
                          className="w-full bg-panel-raised border border-hairline focus:border-primary text-xs font-body text-text-primary p-3.5 rounded-[2px] focus:outline-none transition-colors"
                        />
                        {errors.email && (
                          <p className="text-[10px] font-body text-primary mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-2 font-bold">
                          DISCORD USERNAME
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. viper#9999"
                          {...register("discord")}
                          className="w-full bg-panel-raised border border-hairline focus:border-primary text-xs font-body text-text-primary p-3.5 rounded-[2px] focus:outline-none transition-colors"
                        />
                        {errors.discord && (
                          <p className="text-[10px] font-body text-primary mt-1">{errors.discord.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Region Selector */}
                      <div className="relative">
                        <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-2 font-bold">
                          SERVER REGION
                        </label>
                        <Controller
                          name="region"
                          control={control}
                          render={({ field }) => (
                            <>
                              <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-panel-raised border border-hairline text-xs font-body text-text-primary p-3.5 rounded-[2px] flex items-center justify-between focus:outline-none"
                              >
                                <span>{field.value}</span>
                                <ChevronDown className="w-4 h-4 text-text-muted" />
                              </button>

                              {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-panel-raised border border-hairline z-30 shadow-xl rounded-[2px] overflow-hidden">
                                  {regions.map((r) => (
                                    <button
                                      key={r}
                                      type="button"
                                      onClick={() => {
                                        setValue("region", r);
                                        setIsDropdownOpen(false);
                                      }}
                                      className="w-full p-2.5 text-left text-xs font-body text-text-muted hover:text-white hover:bg-primary/20 transition-colors"
                                    >
                                      {r}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        />
                      </div>

                      {/* Tier Selector */}
                      <div className="relative">
                        <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-2 font-bold">
                          COMPETITIVE DIVISION
                        </label>
                        <Controller
                          name="tier"
                          control={control}
                          render={({ field }) => (
                            <>
                              <button
                                type="button"
                                onClick={() => setIsTierOpen(!isTierOpen)}
                                className="w-full bg-panel-raised border border-hairline text-xs font-body text-text-primary p-3.5 rounded-[2px] flex items-center justify-between focus:outline-none"
                              >
                                <span>{field.value}</span>
                                <ChevronDown className="w-4 h-4 text-text-muted" />
                              </button>

                              {isTierOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-panel-raised border border-hairline z-30 shadow-xl rounded-[2px] overflow-hidden">
                                  {tiers.map((t) => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => {
                                        setValue("tier", t);
                                        setIsTierOpen(false);
                                      }}
                                      className="w-full p-2.5 text-left text-xs font-body text-text-muted hover:text-white hover:bg-primary/20 transition-colors"
                                    >
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Message & Mandatory Terms Agreement */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex items-center gap-2 text-xs font-display text-primary tracking-wider uppercase font-bold">
                      <span>STEP 03 // MATCH OBJECTIVE & TERMS ACCEPTANCE</span>
                    </div>

                    <div>
                      <label className="font-display text-[10px] tracking-widest text-text-muted uppercase block mb-2 font-bold">
                        YOUR MESSAGE OR SCRIM REQUEST
                      </label>
                      <textarea
                        rows={3}
                        placeholder="PROVIDE SQUAD DETAILS, SCRIM PREFERENCES, OR GENERAL INQUIRY..."
                        {...register("message")}
                        className="w-full bg-panel-raised border border-hairline focus:border-primary text-xs font-body text-text-primary p-3.5 rounded-[2px] focus:outline-none resize-none transition-colors"
                      />
                      {errors.message && (
                        <p className="text-[10px] font-body text-primary mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    {/* Mandatory Terms Checkbox */}
                    <div className="p-4 bg-void/60 border border-hairline rounded-[2px] flex flex-col gap-2">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          {...register("agreeTerms")}
                          className="mt-1 w-4 h-4 accent-purple-500 rounded cursor-pointer"
                        />
                        <div className="flex flex-col text-xs font-body text-text-muted leading-relaxed">
                          <span>
                            I have read and agree to the{" "}
                            <Link href="/policy" target="_blank" className="text-primary hover:underline font-semibold inline-flex items-center gap-1">
                              RAVONIXX Policies, Rules & Code of Conduct <ExternalLink className="w-3 h-3" />
                            </Link>
                          </span>
                          <span className="text-[10px] text-text-dim mt-0.5">
                            Compliance with anti-cheating, fair play, and competitive rules is mandatory.
                          </span>
                        </div>
                      </label>
                      {errors.agreeTerms && (
                        <p className="text-[10px] font-body text-red-400 font-semibold pl-7">
                          {errors.agreeTerms.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stepper Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-hairline">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-5 py-3 border border-hairline hover:border-primary text-text-muted hover:text-white font-display text-xs tracking-wider uppercase rounded-[2px] flex items-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> BACK
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-primary hover:bg-primary-hi text-black font-display font-black text-xs tracking-wider uppercase rounded-[2px] flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
                  >
                    NEXT STEP <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={formStatus === "submitting" || !agreeTermsValue}
                    className="px-8 py-3 bg-primary hover:bg-primary-hi text-black font-display font-black text-xs tracking-wider uppercase rounded-[2px] flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {formStatus === "submitting" ? (
                      <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    ) : (
                      <>
                        ACCEPT & SUBMIT <Send className="w-3.5 h-3.5 fill-current" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {formStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-primary/20 border border-primary/60 text-center font-display text-xs tracking-widest text-[#00F0FF] uppercase font-bold rounded flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> REGISTRATION DISPATCHED! OUR TEAM WILL CONTACT YOU ON DISCORD.
                </motion.div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Discord & Official Contact Channels */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Discord Server Card */}
          <div className="relative border border-hairline bg-panel p-8 clip-card flex flex-col justify-center items-center text-center shadow-lg group overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-15 mix-blend-screen -z-0">
              <Image
                src="/design_assets/discord_background.jpeg"
                alt="Discord backdrop"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover object-center"
              />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <svg viewBox="0 0 127.14 96.36" className="w-14 h-14 text-[#5865F2] mb-4" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.88,6.83,77.19,77.19,0,0,0,49.58,0,105.15,105.15,0,0,0,19.14,8.07C2.81,32.22-1.71,55.72.47,78.85A107.4,107.4,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,71.43,71.43,0,0,1-10.5-5A54.34,54.34,0,0,0,31,77.73a76.88,76.88,0,0,0,65.06,0,54.34,54.34,0,0,0,2.89,2.81,71.43,71.43,0,0,1-10.5,5A77.7,77.7,0,0,0,95.14,85.5a107.4,107.4,0,0,0,31.57-17.51C129.66,41.64,124.3,18.4,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>

              <h3 className="display-font font-black italic tracking-wide text-2xl text-text-primary uppercase slanted mb-2">
                <span className="text-primary font-bold mr-1">/</span>DISCORD COMMUNITY
              </h3>

              <p className="font-body text-xs text-text-muted leading-relaxed max-w-sm mb-5 uppercase tracking-wider">
                Join our official Discord server for match lobbies, scrim schedules, and team communications.
              </p>

              <a
                href="https://dsc.gg/ravonixx"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-display text-xs tracking-widest font-extrabold uppercase rounded-none slanted transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(88,101,242,0.4)]"
              >
                <MessageSquare className="w-4 h-4" /> JOIN DSC.GG/RAVONIXX
              </a>
            </div>
          </div>

          {/* Official Inquiries Card */}
          <div className="border border-hairline bg-panel p-6 rounded-[2px] flex flex-col gap-4">
            <h4 className="display-font font-bold text-xs tracking-widest text-text-primary uppercase flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              OFFICIAL CONTACT CHANNELS
            </h4>

            <div className="space-y-3 text-xs font-body">
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="text-text-muted">Direct Email:</span>
                <a href="mailto:contact@ravonixx.xyz" className="text-primary font-mono hover:underline">
                  contact@ravonixx.xyz
                </a>
              </div>
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="text-text-muted">Instagram:</span>
                <a href="https://www.instagram.com/ravonixx.ind" target="_blank" rel="noreferrer" className="text-text-primary hover:text-primary transition-colors">
                  @ravonixx.ind
                </a>
              </div>
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="text-text-muted">YouTube:</span>
                <a href="https://www.youtube.com/@ravonixx-09" target="_blank" rel="noreferrer" className="text-text-primary hover:text-primary transition-colors">
                  @ravonixx-09
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">LinkedIn:</span>
                <a href="https://www.linkedin.com/company/ravonixx" target="_blank" rel="noreferrer" className="text-text-primary hover:text-primary transition-colors">
                  RAVONIXX Org
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
