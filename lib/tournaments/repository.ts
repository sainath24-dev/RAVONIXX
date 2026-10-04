import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  Tournament,
  TournamentRegistration,
  TournamentUpsertInput,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const TOURNAMENTS_FILE = path.join(DATA_DIR, "tournaments.json");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");

// Simple async queue mutex to ensure serialized atomic file writes
class AsyncMutex {
  private queue: Promise<void> = Promise.resolve();

  dispatch<T>(action: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue = this.queue.then(async () => {
        try {
          const res = await action();
          resolve(res);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}

const dbMutex = new AsyncMutex();

async function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  await ensureDataDirectory();
  if (!fs.existsSync(filePath)) {
    await writeAtomic(filePath, defaultValue);
    return defaultValue;
  }
  try {
    const raw = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}, using default:`, err);
    return defaultValue;
  }
}

async function writeAtomic<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDirectory();
  const tempPath = `${filePath}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.promises.rename(tempPath, filePath);
}

// Seed Initial Tournament if empty
async function initSeedDataIfEmpty() {
  const tournaments = await readJsonFile<Tournament[]>(TOURNAMENTS_FILE, []);
  if (tournaments.length === 0) {
    const now = new Date();
    const openDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const closeDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const sampleTournament: Tournament = {
      id: "trn_ravonixx_s1_freefire",
      title: "RAVONIXX Free Fire Championship • Season 1",
      slug: "ravonixx-ff-championship-s1",
      bannerUrl: "/images/maps/Free_Fire_Map_Bermuda_2023.png",
      gameName: "Free Fire Max",
      shortDescription:
        "The flagship Free Fire Squad showdown. 48 Tier-1 teams compete across Bermuda, Purgatory, and Kalahari for ₹50,000 INR.",
      fullDetails: `### Official Tournament Overview
Welcome to the premier **RAVONIXX Free Fire Championship: Season 1**. 

This tournament showcases the finest mobile esports talent across India & South Asia. Teams will battle through qualifiers, semi-finals, and grand finals broadcasted live on the RAVONIXX YouTube & Discord stages.

#### Schedule & Phases
* **Phase 1: Group Qualifiers** — Saturday (6 Matches, Top 24 qualify)
* **Phase 2: Semi-Finals** — Sunday 2:00 PM IST (Top 12 qualify)
* **Phase 3: Grand Finals** — Sunday 7:00 PM IST (6 Rounds)

#### Prize Pool Breakdown (₹50,000 INR)
* **1st Place (Champions):** ₹25,000 + Exclusive RAVONIXX Trophy
* **2nd Place (Runners Up):** ₹12,000
* **3rd Place:** ₹8,000
* **Tournament MVP:** ₹5,000`,
      rules: `### Tournament Rules & Regulations

1. **Format & Mode:** Battle Royale Squad (4 Active Players + 1 Optional Substitute).
2. **Device Policy:** Only handheld smartphones (Android / iOS) are permitted. Emulators, iPads/tablets, triggers, and third-party macro tools are strictly prohibited and will result in instant disqualification and blacklist.
3. **Anti-Cheat:** All players must have a minimum account level of 45 with Heroic rank or above. Game logs and recording of POV may be requested by admins.
4. **Punctuality:** Room credentials will be sent to the Captain's WhatsApp/Email 15 minutes before match start. Teams failing to join within 10 minutes will forfeit their slot.
5. **Fair Play & Code of Conduct:** Toxicity, intentional teaming, bug exploitation, or offensive team names are strictly forbidden. The decision of RAVONIXX administrators is final.`,
      prizePool: "₹50,000 INR",
      entryFee: "Free",
      format: "Squad",
      matchSchedule: "October 18 - 19, 2026 • 6:00 PM IST",
      registrationOpenDate: openDate,
      registrationCloseDate: closeDate,
      maxTeams: 48,
      status: "Registration Open",
      roomDetails: "Room ID & Pass will be released to approved teams 15 mins before match.",
      isRoomDetailsVisible: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await writeAtomic(TOURNAMENTS_FILE, [sampleTournament]);
  }
}

// Initialize seed on module load
initSeedDataIfEmpty().catch(console.error);

// ---------------- TOURNAMENTS REPOSITORY ---------------- //

export async function getAllTournaments(): Promise<Tournament[]> {
  return readJsonFile<Tournament[]>(TOURNAMENTS_FILE, []);
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  const tournaments = await getAllTournaments();
  return tournaments.find((t) => t.id === id) || null;
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  const tournaments = await getAllTournaments();
  return tournaments.find((t) => t.slug === slug) || null;
}

export async function createTournament(
  input: TournamentUpsertInput
): Promise<Tournament> {
  return dbMutex.dispatch(async () => {
    const tournaments = await getAllTournaments();
    const existing = tournaments.find((t) => t.slug === input.slug);
    if (existing) {
      throw new Error(`A tournament with slug "${input.slug}" already exists`);
    }

    const now = new Date().toISOString();
    const newTournament: Tournament = {
      id: `trn_${crypto.randomUUID().slice(0, 8)}`,
      ...input,
      entryFee: input.entryFee || "Free",
      bannerUrl: input.bannerUrl || undefined,
      maxTeams: input.maxTeams || undefined,
      createdAt: now,
      updatedAt: now,
    };

    tournaments.unshift(newTournament);
    await writeAtomic(TOURNAMENTS_FILE, tournaments);
    return newTournament;
  });
}

export async function updateTournament(
  id: string,
  input: Partial<TournamentUpsertInput>
): Promise<Tournament> {
  return dbMutex.dispatch(async () => {
    const tournaments = await getAllTournaments();
    const index = tournaments.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error("Tournament not found");
    }

    if (input.slug) {
      const duplicateSlug = tournaments.find(
        (t) => t.slug === input.slug && t.id !== id
      );
      if (duplicateSlug) {
        throw new Error(`A tournament with slug "${input.slug}" already exists`);
      }
    }

    const updated: Tournament = {
      ...tournaments[index],
      ...input,
      entryFee: input.entryFee !== undefined ? input.entryFee : tournaments[index].entryFee,
      bannerUrl: input.bannerUrl !== undefined ? input.bannerUrl : tournaments[index].bannerUrl,
      maxTeams: input.maxTeams !== undefined ? input.maxTeams || undefined : tournaments[index].maxTeams,
      updatedAt: new Date().toISOString(),
    };

    tournaments[index] = updated;
    await writeAtomic(TOURNAMENTS_FILE, tournaments);
    return updated;
  });
}

export async function deleteTournament(id: string): Promise<boolean> {
  return dbMutex.dispatch(async () => {
    const tournaments = await getAllTournaments();
    const filtered = tournaments.filter((t) => t.id !== id);
    if (filtered.length === tournaments.length) return false;

    await writeAtomic(TOURNAMENTS_FILE, filtered);

    // Also cascade remove registrations for this tournament
    const registrations = await readJsonFile<TournamentRegistration[]>(
      REGISTRATIONS_FILE,
      []
    );
    const remainingRegs = registrations.filter((r) => r.tournamentId !== id);
    await writeAtomic(REGISTRATIONS_FILE, remainingRegs);

    return true;
  });
}

// ---------------- REGISTRATIONS REPOSITORY ---------------- //

export async function getAllRegistrations(): Promise<TournamentRegistration[]> {
  return readJsonFile<TournamentRegistration[]>(REGISTRATIONS_FILE, []);
}

export async function getRegistrationsByTournamentId(
  tournamentId: string
): Promise<TournamentRegistration[]> {
  const registrations = await getAllRegistrations();
  return registrations
    .filter((r) => r.tournamentId === tournamentId)
    .sort((a, b) => a.registrationNumber - b.registrationNumber);
}

export async function getRegistrationById(
  id: string
): Promise<TournamentRegistration | null> {
  const registrations = await getAllRegistrations();
  return registrations.find((r) => r.id === id) || null;
}

export async function getDuplicateUidsInTournament(
  tournamentId: string,
  uidsToCheck: string[]
): Promise<string[]> {
  const existingRegistrations = await getRegistrationsByTournamentId(tournamentId);
  const registeredUids = new Set<string>();

  for (const reg of existingRegistrations) {
    if (reg.captain?.uid) registeredUids.add(reg.captain.uid.trim());
    if (Array.isArray(reg.players)) {
      for (const p of reg.players) {
        if (p?.uid) registeredUids.add(p.uid.trim());
      }
    }
    if (reg.substitute?.uid) {
      registeredUids.add(reg.substitute.uid.trim());
    }
  }

  const duplicates: string[] = [];
  for (const uid of uidsToCheck) {
    const cleanUid = uid.trim();
    if (registeredUids.has(cleanUid)) {
      duplicates.push(cleanUid);
    }
  }

  return duplicates;
}

export async function isTeamNameTakenInTournament(
  tournamentId: string,
  teamName: string
): Promise<boolean> {
  const registrations = await getRegistrationsByTournamentId(tournamentId);
  const normalized = teamName.trim().toLowerCase();
  return registrations.some((r) => r.teamName.trim().toLowerCase() === normalized);
}

export async function createRegistration(
  registrationData: Omit<TournamentRegistration, "id" | "registrationNumber" | "createdAt">
): Promise<TournamentRegistration> {
  return dbMutex.dispatch(async () => {
    const registrations = await getAllRegistrations();
    const tournamentRegs = registrations.filter(
      (r) => r.tournamentId === registrationData.tournamentId
    );

    // Auto-increment per tournament
    const highestRegNum = tournamentRegs.reduce(
      (max, r) => Math.max(max, r.registrationNumber || 0),
      0
    );
    const nextRegistrationNumber = highestRegNum + 1;

    const newRegistration: TournamentRegistration = {
      ...registrationData,
      id: `reg_${crypto.randomUUID().slice(0, 10)}`,
      registrationNumber: nextRegistrationNumber,
      createdAt: new Date().toISOString(),
    };

    registrations.push(newRegistration);
    await writeAtomic(REGISTRATIONS_FILE, registrations);
    return newRegistration;
  });
}

export async function updateRegistration(
  id: string,
  updates: Partial<TournamentRegistration>
): Promise<TournamentRegistration> {
  return dbMutex.dispatch(async () => {
    const registrations = await getAllRegistrations();
    const index = registrations.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error("Registration record not found");
    }

    const updated: TournamentRegistration = {
      ...registrations[index],
      ...updates,
      // Protect immutable fields
      id: registrations[index].id,
      tournamentId: registrations[index].tournamentId,
      registrationNumber: registrations[index].registrationNumber,
      createdAt: registrations[index].createdAt,
    };

    registrations[index] = updated;
    await writeAtomic(REGISTRATIONS_FILE, registrations);
    return updated;
  });
}

export async function deleteRegistration(id: string): Promise<boolean> {
  return dbMutex.dispatch(async () => {
    const registrations = await getAllRegistrations();
    const filtered = registrations.filter((r) => r.id !== id);
    if (filtered.length === registrations.length) return false;

    await writeAtomic(REGISTRATIONS_FILE, filtered);
    return true;
  });
}
