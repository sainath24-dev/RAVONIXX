import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

// Detect if running in Vercel / AWS Lambda / read-only serverless environment
export function isServerlessEnvironment(): boolean {
  return Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.VERCEL_ENV
  );
}

// Global cache across warm serverless invocations
const globalStore = globalThis as unknown as {
  __ravonixx_cache?: Record<string, unknown>;
  __ravonixx_data_dir?: string;
};

if (!globalStore.__ravonixx_cache) {
  globalStore.__ravonixx_cache = {};
}

export function getCached<T>(key: string): T | undefined {
  return globalStore.__ravonixx_cache?.[key] as T | undefined;
}

export function setCached<T>(key: string, data: T): void {
  if (!globalStore.__ravonixx_cache) {
    globalStore.__ravonixx_cache = {};
  }
  globalStore.__ravonixx_cache[key] = data;
}

// Clear cache key if needed
export function clearCached(key: string): void {
  if (globalStore.__ravonixx_cache) {
    delete globalStore.__ravonixx_cache[key];
  }
}

// Safe JSON reader with multi-tier fallback: Memory -> Writable /tmp -> Project ./data -> Default
export async function readJsonData<T>(filename: string, defaultValue: T): Promise<T> {
  // 1. Check in-memory warm cache
  const cached = getCached<T>(filename);
  if (cached !== undefined) {
    return cached;
  }

  // 2. Check writable /tmp/ravonixx-data first (captures runtime mutations on serverless)
  const tmpFile = path.join(os.tmpdir(), "ravonixx-data", filename);
  try {
    if (fs.existsSync(tmpFile)) {
      const content = await fs.promises.readFile(tmpFile, "utf-8");
      const parsed = JSON.parse(content) as T;
      setCached(filename, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn(`Could not read tmp file ${tmpFile}:`, err);
  }

  // 3. Check project ./data/ directory (bundled files or local disk)
  const localFile = path.join(process.cwd(), "data", filename);
  try {
    if (fs.existsSync(localFile)) {
      const content = await fs.promises.readFile(localFile, "utf-8");
      const parsed = JSON.parse(content) as T;
      setCached(filename, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn(`Could not read local file ${localFile}:`, err);
  }

  // 4. Fallback to default
  setCached(filename, defaultValue);
  return defaultValue;
}

// Safe JSON writer: Updates memory cache + writes directly to ./data/ (if writable) + writes to /tmp/ravonixx-data/
export async function writeJsonData<T>(filename: string, data: T): Promise<void> {
  // Always update in-memory cache first so next read immediately has latest data
  setCached(filename, data);

  const jsonString = JSON.stringify(data, null, 2);

  // 1. Persist directly to project ./data/ directory if writable (local dev & persistent environments)
  try {
    const localDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(localDir)) {
      await fs.promises.mkdir(localDir, { recursive: true });
    }
    const localFile = path.join(localDir, filename);
    const tempLocalFile = path.join(localDir, `${filename}.${crypto.randomBytes(6).toString("hex")}.tmp`);
    await fs.promises.writeFile(tempLocalFile, jsonString, "utf-8");
    await fs.promises.rename(tempLocalFile, localFile);
  } catch {
    // If localDir is read-only (e.g. Vercel serverless /var/task), safe to ignore
  }

  // 2. Also write to writable /tmp/ravonixx-data/ for serverless environments
  try {
    const tmpDir = path.join(os.tmpdir(), "ravonixx-data");
    if (!fs.existsSync(tmpDir)) {
      await fs.promises.mkdir(tmpDir, { recursive: true });
    }
    const targetPath = path.join(tmpDir, filename);
    const tempPath = path.join(tmpDir, `${filename}.${crypto.randomBytes(6).toString("hex")}.tmp`);
    await fs.promises.writeFile(tempPath, jsonString, "utf-8");
    await fs.promises.rename(tempPath, targetPath);
  } catch (err) {
    console.error(`Warning: Failed to write ${filename} to tmp:`, err);
  }
}
