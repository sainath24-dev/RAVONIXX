import { z } from "zod";

export type TournamentStatus =
  | "Draft"
  | "Registration Open"
  | "Registration Closed"
  | "Ongoing"
  | "Completed";

export type TournamentFormat = "Solo" | "Duo" | "Squad";

export type TournamentEventMode = "LAN" | "Online" | "Hybrid" | "Watch Party";

export type TournamentStage = "SIGN-UP" | "CHECK-IN" | "GROUPING" | "IN PROGRESS" | "ENDED";

export interface ScheduledGameMap {
  gameNumber: number;
  time: string;
  mapName: string;
  mapImage?: string;
}

export interface Tournament {
  id: string;
  title: string;
  slug: string;
  bannerUrl?: string;
  whatsappGroupUrl?: string;
  gameCount?: number;
  currentStage?: TournamentStage;
  mapsSchedule?: ScheduledGameMap[];
  gameName: string;
  shortDescription: string;
  fullDetails: string;
  rules: string;
  prizePool: string;
  prizeCash?: string;
  prizeDiamonds?: string;
  entryFee?: string;
  format: TournamentFormat;
  eventMode?: TournamentEventMode;
  matchSchedule: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  maxTeams?: number;
  status: TournamentStatus;
  roomDetails?: string;
  isRoomDetailsVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerInfo {
  name: string;
  uid: string; // Stored strictly as string to avoid scientific notation
}

export interface CaptainInfo extends PlayerInfo {
  ign: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  registrationNumber: number; // Auto-increment per tournament (1, 2, 3...)
  teamName: string;
  captain: CaptainInfo;
  players: PlayerInfo[]; // Configured per format: Solo = 0, Duo = 1, Squad = 3
  substitute?: PlayerInfo;
  contact: {
    phone: string;
    email: string;
  };
  adminRank?: string; // Admin-only rank / standing (e.g., #1, Top 4)
  adminNotes?: string;
  status: "Approved" | "Pending" | "Rejected";
  clientIp?: string;
  createdAt: string;
}

// Validation schemas
export const playerSchema = z.object({
  name: z.string().trim().min(2, "Player name must be at least 2 characters").max(60),
  uid: z
    .string()
    .trim()
    .regex(/^\d+$/, "UID must contain digits only")
    .min(5, "UID must be at least 5 digits")
    .max(25, "UID must not exceed 25 digits"),
});

export const captainSchema = playerSchema.extend({
  ign: z.string().trim().min(2, "IGN must be at least 2 characters").max(50),
});

export const tournamentRegistrationSchema = z.object({
  teamName: z.string().trim().min(2, "Team name must be at least 2 characters").max(60),
  captain: captainSchema,
  players: z.array(playerSchema).max(4),
  substitute: playerSchema.optional(),
  contact: z.object({
    phone: z
      .string()
      .trim()
      .min(8, "Valid phone or WhatsApp number is required")
      .max(20),
    email: z.string().trim().email("Please provide a valid email address").max(120),
  }),
  agreeRules: z.boolean().refine((val) => val === true, {
    message: "You must read and agree to tournament rules",
  }),
  hp_website: z.string().max(0, "Invalid submission").optional(), // Honeypot field
});

export type TournamentRegistrationInput = z.infer<typeof tournamentRegistrationSchema>;

export const tournamentUpsertSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(150),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  bannerUrl: z.string().trim().optional().or(z.literal("")),
  gameName: z.string().trim().min(2, "Game name is required").max(60),
  shortDescription: z.string().trim().min(2, "Short description is required").max(500),
  fullDetails: z.string().trim().min(2, "Details are required"),
  rules: z.string().trim().min(2, "Rules are required"),
  prizePool: z.string().trim().min(1, "Prize pool is required").max(100),
  prizeCash: z.string().trim().optional(),
  prizeDiamonds: z.string().trim().optional(),
  entryFee: z.string().trim().max(100).optional(),
  format: z.enum(["Solo", "Duo", "Squad"]),
  eventMode: z.enum(["LAN", "Online", "Hybrid", "Watch Party"]).optional().default("Online"),
  matchSchedule: z.string().trim().min(2, "Schedule is required"),
  registrationOpenDate: z.string().min(5, "Registration open date is required"),
  registrationCloseDate: z.string().min(5, "Registration close date is required"),
  maxTeams: z.number().int().positive().optional().nullable(),
  status: z.enum([
    "Draft",
    "Registration Open",
    "Registration Closed",
    "Ongoing",
    "Completed",
  ]),
  whatsappGroupUrl: z.string().trim().optional().or(z.literal("")),
  gameCount: z.number().int().positive().optional(),
  currentStage: z.enum(["SIGN-UP", "CHECK-IN", "GROUPING", "IN PROGRESS", "ENDED"]).optional(),
  mapsSchedule: z.array(z.object({
    gameNumber: z.number().int(),
    time: z.string(),
    mapName: z.string(),
    mapImage: z.string().optional(),
  })).optional(),
  roomDetails: z.string().optional(),
  isRoomDetailsVisible: z.boolean().default(false),
});

export type TournamentUpsertInput = z.infer<typeof tournamentUpsertSchema>;
