// In-memory rate limiting map for tournament registrations: IP -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

const REGISTRATION_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REGISTRATIONS_PER_WINDOW = 3; // Max 3 registrations per minute per IP

export function isRegistrationRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, {
      count: 1,
      expiresAt: now + REGISTRATION_RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (record.count >= MAX_REGISTRATIONS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

export function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "") // Strip raw HTML tags to prevent XSS
    .trim();
}
