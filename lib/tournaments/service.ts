import {
  Tournament,
  TournamentRegistration,
  TournamentRegistrationInput,
  TournamentUpsertInput,
} from "./types";
import * as repo from "./repository";
import { sanitizeText } from "./rate-limit";

export interface TournamentWithMeta extends Tournament {
  registeredCount: number;
  slotsRemaining: number | null;
  isRegistrationCurrentlyOpen: boolean;
  computedStatus: string;
}

/**
 * Computes live status and slot statistics for a tournament
 */
export function computeTournamentMeta(
  tournament: Tournament,
  registrations: TournamentRegistration[]
): TournamentWithMeta {
  const registeredCount = registrations.length;
  const slotsRemaining =
    tournament.maxTeams !== undefined && tournament.maxTeams !== null
      ? Math.max(0, tournament.maxTeams - registeredCount)
      : null;

  const now = new Date();
  const openTime = new Date(tournament.registrationOpenDate);
  const closeTime = new Date(tournament.registrationCloseDate);

  const isWithinDateWindow = now >= openTime && now <= closeTime;
  const isSlotsAvailable = slotsRemaining === null || slotsRemaining > 0;

  let computedStatus = tournament.status;

  // Auto status transition logic if marked as Registration Open but dates passed or slots filled
  if (tournament.status === "Registration Open") {
    if (!isWithinDateWindow || !isSlotsAvailable) {
      computedStatus = "Registration Closed";
    }
  }

  const isRegistrationCurrentlyOpen =
    tournament.status === "Registration Open" &&
    isWithinDateWindow &&
    isSlotsAvailable;

  return {
    ...tournament,
    registeredCount,
    slotsRemaining,
    isRegistrationCurrentlyOpen,
    computedStatus,
  };
}

// ---------------- TOURNAMENT SERVICE API ---------------- //

export async function listPublicTournaments(): Promise<TournamentWithMeta[]> {
  const tournaments = await repo.getAllTournaments();
  const allRegistrations = await repo.getAllRegistrations();

  // Filter out Draft tournaments for public view
  const publicTournaments = tournaments.filter((t) => t.status !== "Draft");

  return publicTournaments.map((t) => {
    const regs = allRegistrations.filter((r) => r.tournamentId === t.id);
    return computeTournamentMeta(t, regs);
  });
}

export async function getTournamentDetailBySlug(
  slug: string,
  isAdmin: boolean = false
): Promise<TournamentWithMeta | null> {
  const tournament = await repo.getTournamentBySlug(slug);
  if (!tournament) return null;

  if (!isAdmin && tournament.status === "Draft") {
    return null;
  }

  const regs = await repo.getRegistrationsByTournamentId(tournament.id);
  const meta = computeTournamentMeta(tournament, regs);

  // If not admin and room details are hidden, redact them
  if (!isAdmin && !tournament.isRoomDetailsVisible) {
    meta.roomDetails = undefined;
  }

  return meta;
}

export async function listAdminTournaments(): Promise<TournamentWithMeta[]> {
  const tournaments = await repo.getAllTournaments();
  const allRegistrations = await repo.getAllRegistrations();

  return tournaments.map((t) => {
    const regs = allRegistrations.filter((r) => r.tournamentId === t.id);
    return computeTournamentMeta(t, regs);
  });
}

export async function createTournament(
  input: TournamentUpsertInput
): Promise<Tournament> {
  return repo.createTournament(input);
}

export async function updateTournament(
  id: string,
  input: Partial<TournamentUpsertInput>
): Promise<Tournament> {
  return repo.updateTournament(id, input);
}

export async function deleteTournament(id: string): Promise<boolean> {
  return repo.deleteTournament(id);
}

export async function duplicateTournament(id: string): Promise<Tournament> {
  const original = await repo.getTournamentById(id);
  if (!original) {
    throw new Error("Tournament to duplicate not found");
  }

  const timestamp = Date.now().toString().slice(-4);
  const newSlug = `${original.slug}-copy-${timestamp}`;
  const newTitle = `${original.title} (Copy)`;

  const duplicateInput: TournamentUpsertInput = {
    title: newTitle,
    slug: newSlug,
    bannerUrl: original.bannerUrl,
    gameName: original.gameName,
    shortDescription: original.shortDescription,
    fullDetails: original.fullDetails,
    rules: original.rules,
    prizePool: original.prizePool,
    entryFee: original.entryFee,
    format: original.format,
    matchSchedule: original.matchSchedule,
    registrationOpenDate: original.registrationOpenDate,
    registrationCloseDate: original.registrationCloseDate,
    maxTeams: original.maxTeams,
    status: "Draft", // Always start duplicates in Draft
    roomDetails: original.roomDetails,
    isRoomDetailsVisible: false,
  };

  return repo.createTournament(duplicateInput);
}

// ---------------- REGISTRATION SERVICE API ---------------- //

export async function registerTeamForTournament(
  slug: string,
  input: TournamentRegistrationInput,
  clientIp?: string
): Promise<{ success: true; registration: TournamentRegistration }> {
  // 1. Fetch tournament
  const tournament = await repo.getTournamentBySlug(slug);
  if (!tournament) {
    throw new Error("Tournament not found");
  }

  // 2. Fetch existing registrations
  const existingRegistrations = await repo.getRegistrationsByTournamentId(tournament.id);
  const meta = computeTournamentMeta(tournament, existingRegistrations);

  // 3. Strict Server-Side Validation: Is registration open?
  if (tournament.status !== "Registration Open") {
    throw new Error(`Registration is currently ${tournament.status.toLowerCase()}`);
  }

  const now = new Date();
  if (now < new Date(tournament.registrationOpenDate)) {
    throw new Error("Registration has not opened yet");
  }
  if (now > new Date(tournament.registrationCloseDate)) {
    throw new Error("Registration has closed for this tournament");
  }

  // 4. Slot Limit Validation
  if (tournament.maxTeams && existingRegistrations.length >= tournament.maxTeams) {
    throw new Error("Registration slots are full for this tournament");
  }

  // 5. Intra-form UID duplication check (cannot repeat across captain, players, substitute)
  const allFormUids: { uid: string; role: string }[] = [];
  allFormUids.push({ uid: input.captain.uid.trim(), role: "Captain (Player 1)" });

  input.players.forEach((p, idx) => {
    allFormUids.push({ uid: p.uid.trim(), role: `Player ${idx + 2}` });
  });

  if (input.substitute?.uid) {
    allFormUids.push({ uid: input.substitute.uid.trim(), role: `Substitute (Player ${input.players.length + 2})` });
  }

  const seenUids = new Map<string, string>();
  for (const item of allFormUids) {
    if (seenUids.has(item.uid)) {
      throw new Error(
        `Duplicate UID detected within your team: UID "${item.uid}" is assigned to both ${seenUids.get(
          item.uid
        )} and ${item.role}`
      );
    }
    seenUids.set(item.uid, item.role);
  }

  // 6. Tournament-wide Team Name check (case-insensitive)
  const isTeamTaken = await repo.isTeamNameTakenInTournament(
    tournament.id,
    input.teamName
  );
  if (isTeamTaken) {
    throw new Error(
      `Team name "${input.teamName}" is already registered in this tournament. Please choose a different team name.`
    );
  }

  // 7. Tournament-wide UID check (UID cannot appear across ANY team in this tournament)
  const uidsToCheck = allFormUids.map((u) => u.uid);
  const duplicateUids = await repo.getDuplicateUidsInTournament(
    tournament.id,
    uidsToCheck
  );

  if (duplicateUids.length > 0) {
    throw new Error(
      `The following Player UID(s) are already registered in this tournament: ${duplicateUids.join(
        ", "
      )}. A player cannot participate under multiple teams.`
    );
  }

  // 8. Sanitize all textual inputs (UTF-8 safe, strip harmful script tags)
  const sanitizedRegistration = {
    tournamentId: tournament.id,
    teamName: sanitizeText(input.teamName),
    captain: {
      name: sanitizeText(input.captain.name),
      ign: sanitizeText(input.captain.ign),
      uid: sanitizeText(input.captain.uid),
    },
    players: input.players.map((p) => ({
      name: sanitizeText(p.name),
      uid: sanitizeText(p.uid),
    })),
    substitute: input.substitute?.name && input.substitute?.uid
      ? {
          name: sanitizeText(input.substitute.name),
          uid: sanitizeText(input.substitute.uid),
        }
      : undefined,
    contact: {
      phone: sanitizeText(input.contact.phone),
      email: sanitizeText(input.contact.email),
    },
    status: "Approved" as const,
    clientIp,
  };

  // 9. Persist Registration with auto-increment registrationNumber
  const created = await repo.createRegistration(sanitizedRegistration);

  // 10. Trigger Discord notification if configured
  notifyDiscordRegistration(tournament, created).catch(console.error);

  return { success: true, registration: created };
}

async function notifyDiscordRegistration(
  tournament: Tournament,
  reg: TournamentRegistration
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = {
      username: "RAVONIXX Tournament Dispatch",
      embeds: [
        {
          title: `🏆 New Team Registered: ${reg.teamName}`,
          description: `**Tournament:** ${tournament.title} (${tournament.format})\n**Registration Number:** \`#${reg.registrationNumber}\``,
          color: 11026687, // Brand purple
          fields: [
            {
              name: "👑 Captain",
              value: `${reg.captain.name} (IGN: \`${reg.captain.ign}\`, UID: \`${reg.captain.uid}\`)`,
              inline: false,
            },
            {
              name: `👥 Active Players (${reg.players.length})`,
              value: reg.players
                .map((p, i) => `${i + 1}. ${p.name} (\`${p.uid}\`)`)
                .join("\n") || "None",
              inline: false,
            },
            ...(reg.substitute?.name
              ? [
                  {
                    name: "🔄 Substitute",
                    value: `${reg.substitute.name} (\`${reg.substitute.uid}\`)`,
                    inline: false,
                  },
                ]
              : []),
            {
              name: "📞 Captain Contact",
              value: `Phone/WA: ${reg.contact.phone} | Email: ${reg.contact.email}`,
              inline: false,
            },
          ],
          footer: {
            text: `RAVONIXX Esports • Slot ${reg.registrationNumber}/${tournament.maxTeams || "∞"}`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Failed to dispatch tournament discord notification:", err);
  }
}
