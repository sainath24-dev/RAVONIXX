import crypto from "crypto";
import {
  Tournament,
  TournamentRegistration,
  TournamentUpsertInput,
} from "./types";
import { readJsonData, writeJsonData } from "@/lib/serverless-fs";

const TOURNAMENTS_KEY = "tournaments.json";
const REGISTRATIONS_KEY = "registrations.json";

// Simple async queue mutex to ensure serialized atomic operations
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

// ---------------- TOURNAMENTS REPOSITORY ---------------- //

export async function getAllTournaments(): Promise<Tournament[]> {
  return readJsonData<Tournament[]>(TOURNAMENTS_KEY, []);
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
    await writeJsonData(TOURNAMENTS_KEY, tournaments);
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
    await writeJsonData(TOURNAMENTS_KEY, tournaments);
    return updated;
  });
}

export async function deleteTournament(id: string): Promise<boolean> {
  return dbMutex.dispatch(async () => {
    const tournaments = await getAllTournaments();
    const filtered = tournaments.filter((t) => t.id !== id);
    if (filtered.length === tournaments.length) return false;

    await writeJsonData(TOURNAMENTS_KEY, filtered);

    // Also cascade remove registrations for this tournament
    const registrations = await readJsonData<TournamentRegistration[]>(
      REGISTRATIONS_KEY,
      []
    );
    const remainingRegs = registrations.filter((r) => r.tournamentId !== id);
    await writeJsonData(REGISTRATIONS_KEY, remainingRegs);

    return true;
  });
}

// ---------------- REGISTRATIONS REPOSITORY ---------------- //

export async function getAllRegistrations(): Promise<TournamentRegistration[]> {
  return readJsonData<TournamentRegistration[]>(REGISTRATIONS_KEY, []);
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
    await writeJsonData(REGISTRATIONS_KEY, registrations);
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
    await writeJsonData(REGISTRATIONS_KEY, registrations);
    return updated;
  });
}

export async function deleteRegistration(id: string): Promise<boolean> {
  return dbMutex.dispatch(async () => {
    const registrations = await getAllRegistrations();
    const filtered = registrations.filter((r) => r.id !== id);
    if (filtered.length === registrations.length) return false;

    await writeJsonData(REGISTRATIONS_KEY, filtered);
    return true;
  });
}
