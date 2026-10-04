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

// Determine safe writable directory
export function getWritableDataDir(): string {
  if (globalStore.__ravonixx_data_dir) {
    return globalStore.__ravonixx_data_dir;
  }

  // If in serverless or production, directly use os.tmpdir()
  if (isServerlessEnvironment() || process.env.NODE_ENV === "production") {
    const tmpDir = path.join(os.tmpdir(), "ravonixx-data");
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      globalStore.__ravonixx_data_dir = tmpDir;
      return tmpDir;
    } catch {
      globalStore.__ravonixx_data_dir = os.tmpdir();
      return os.tmpdir();
    }
  }

  // Local development: test if process.cwd()/data is writable
  const localDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, `.write_test_${Date.now()}`);
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    globalStore.__ravonixx_data_dir = localDir;
    return localDir;
  } catch {
    // If local dir is not writable (e.g. read-only container), fallback to tmpdir
    const tmpDir = path.join(os.tmpdir(), "ravonixx-data");
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {
      // ignore
    }
    globalStore.__ravonixx_data_dir = tmpDir;
    return tmpDir;
  }
}

// Get the bundled seed path in the deployment package
export function getBundledSeedPath(filename: string): string {
  return path.join(process.cwd(), "data", filename);
}

// Safe JSON reader with multi-tier fallback: Memory -> Writable /tmp -> Bundled Seed -> Default
export async function readJsonData<T>(filename: string, defaultValue: T): Promise<T> {
  // 1. Check in-memory warm cache
  const cached = getCached<T>(filename);
  if (cached !== undefined) {
    return cached;
  }

  const writableDir = getWritableDataDir();
  const writableFile = path.join(writableDir, filename);

  // 2. Check writable file (e.g. in /tmp/ravonixx-data)
  try {
    if (fs.existsSync(writableFile)) {
      const content = await fs.promises.readFile(writableFile, "utf-8");
      const parsed = JSON.parse(content) as T;
      setCached(filename, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn(`Could not read writable file ${writableFile}:`, err);
  }

  // 3. Check bundled seed file in process.cwd()/data
  const seedFile = getBundledSeedPath(filename);
  try {
    if (fs.existsSync(seedFile)) {
      const content = await fs.promises.readFile(seedFile, "utf-8");
      const parsed = JSON.parse(content) as T;
      setCached(filename, parsed);

      // Best effort seed copy to writable path
      try {
        if (!fs.existsSync(writableDir)) {
          await fs.promises.mkdir(writableDir, { recursive: true });
        }
        await fs.promises.writeFile(writableFile, content, "utf-8");
      } catch {
        // Ignore copy errors
      }

      return parsed;
    }
  } catch (err) {
    console.warn(`Could not read bundled seed file ${seedFile}:`, err);
  }

  // 4. Fallback to default
  setCached(filename, defaultValue);
  return defaultValue;
}

// Safe JSON writer: Updates memory cache + atomic write to writable /tmp
export async function writeJsonData<T>(filename: string, data: T): Promise<void> {
  // Always update in-memory cache first so next read immediately has latest data
  setCached(filename, data);

  const writableDir = getWritableDataDir();
  const targetPath = path.join(writableDir, filename);
  const tempPath = path.join(writableDir, `${filename}.${crypto.randomBytes(6).toString("hex")}.tmp`);

  try {
    if (!fs.existsSync(writableDir)) {
      await fs.promises.mkdir(writableDir, { recursive: true });
    }
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
    await fs.promises.rename(tempPath, targetPath);
  } catch (err) {
    console.error(`Warning: Failed to write ${filename} to disk:`, err);
    // Even if disk write failed on read-only system, data remains safely in memory cache!
  }
}
