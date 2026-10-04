import { Player, players as fallbackPlayers } from "@/lib/players";
import { readJsonData, writeJsonData } from "@/lib/serverless-fs";

const PLAYERS_KEY = "players.json";

class SimpleMutex {
  private locked = false;
  private queue: (() => void)[] = [];

  async lock(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true;
      return () => this.unlock();
    }
    return new Promise((resolve) => {
      this.queue.push(() => {
        this.locked = true;
        resolve(() => this.unlock());
      });
    });
  }

  private unlock() {
    this.locked = false;
    const next = this.queue.shift();
    if (next) {
      next();
    }
  }
}

const mutex = new SimpleMutex();

async function readPlayersFile(): Promise<Player[]> {
  try {
    const parsed = await readJsonData<Player[]>(PLAYERS_KEY, fallbackPlayers);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return fallbackPlayers;
  } catch (err: unknown) {
    console.error("Error reading players file, using fallback:", err);
    return fallbackPlayers;
  }
}

async function writePlayersFile(players: Player[]): Promise<void> {
  await writeJsonData(PLAYERS_KEY, players);
}

export async function getAllPlayers(): Promise<Player[]> {
  const release = await mutex.lock();
  try {
    return await readPlayersFile();
  } finally {
    release();
  }
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const release = await mutex.lock();
  try {
    const players = await readPlayersFile();
    return players.find((p) => p.id === id) || null;
  } finally {
    release();
  }
}

export async function createPlayer(playerData: Omit<Player, "id"> & { id?: string }): Promise<Player> {
  const release = await mutex.lock();
  try {
    const players = await readPlayersFile();
    const id = playerData.id && playerData.id.trim()
      ? playerData.id.toLowerCase().replace(/[^a-z0-9_-]/g, "")
      : playerData.ign.toLowerCase().replace(/[^a-z0-9_-]/g, "");

    // Ensure unique ID
    let finalId = id || `player_${Date.now()}`;
    if (players.some((p) => p.id === finalId)) {
      finalId = `${finalId}_${Date.now().toString().slice(-4)}`;
    }

    const newPlayer: Player = {
      ...playerData,
      id: finalId,
      loadout: playerData.loadout || { skills: [], weapons: [] },
      settings: playerData.settings || {
        generalSens: 100,
        redDotSens: 100,
        scope2xSens: 100,
        scope4xSens: 100,
        sniperScopeSens: 100,
        freeLookSens: 100,
        controlLayout: "4-finger claw",
        hudCode: "",
        gyroscope: true,
      },
      achievements: playerData.achievements || [],
      socials: playerData.socials || {},
    };

    players.push(newPlayer);
    await writePlayersFile(players);
    return newPlayer;
  } finally {
    release();
  }
}

export async function updatePlayer(id: string, updates: Partial<Player>): Promise<Player | null> {
  const release = await mutex.lock();
  try {
    const players = await readPlayersFile();
    const idx = players.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const updated: Player = {
      ...players[idx],
      ...updates,
      id, // Preserve ID
    };

    players[idx] = updated;
    await writePlayersFile(players);
    return updated;
  } finally {
    release();
  }
}

export async function deletePlayer(id: string): Promise<boolean> {
  const release = await mutex.lock();
  try {
    const players = await readPlayersFile();
    const filtered = players.filter((p) => p.id !== id);
    if (filtered.length === players.length) return false;

    await writePlayersFile(filtered);
    return true;
  } finally {
    release();
  }
}
