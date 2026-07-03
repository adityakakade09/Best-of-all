import { cacheGet, cacheSet, cacheDel } from '../cache/redis';

const OTP_TTL_SECONDS = 300; // 5 minutes
const DEV_OTP = '123456';

/**
 * In dev/demo mode we simulate an SMS OTP provider: "sending" the OTP just
 * stores it in Redis, and it's always `123456` so the app is fully testable
 * without a live SMS gateway. Swap this module out for Firebase Phone Auth
 * (see firebaseAdmin.ts) or an SMS partner (e.g. MSG91, Twilio Verify) in
 * production by setting AUTH_DEV_MODE=false.
 */
export async function sendDevOtp(phone: string): Promise<void> {
  await cacheSet(`otp:${phone}`, DEV_OTP, OTP_TTL_SECONDS);
}

export async function verifyDevOtp(phone: string, otp: string): Promise<boolean> {
  const stored = await cacheGet<string>(`otp:${phone}`);
  const valid = stored !== null && stored === otp;
  if (valid) await cacheDel(`otp:${phone}`);
  return valid;
}
