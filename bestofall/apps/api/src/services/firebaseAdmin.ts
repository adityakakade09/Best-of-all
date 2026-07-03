import admin from 'firebase-admin';
import { env } from '../config/env';
import { logger } from '../config/logger';

let initialized = false;

export function getFirebaseAdmin(): admin.app.App | null {
  if (env.authDevMode) return null; // dev mode never touches Firebase
  if (!initialized) {
    if (!env.firebase.projectId || !env.firebase.clientEmail || !env.firebase.privateKey) {
      logger.warn(
        'Firebase Admin credentials are not fully set — phone OTP verification will fail until FIREBASE_* env vars are configured.'
      );
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey,
      }),
    });
    initialized = true;
  }
  return admin.app();
}

/**
 * Verifies a Firebase ID token produced client-side after phone OTP
 * verification (Firebase Auth's `signInWithPhoneNumber` flow) and returns
 * the verified E.164 phone number.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<string> {
  const app = getFirebaseAdmin();
  if (!app) throw new Error('Firebase not initialized (AUTH_DEV_MODE is on)');
  const decoded = await admin.auth(app).verifyIdToken(idToken);
  if (!decoded.phone_number) throw new Error('Token has no verified phone number');
  return decoded.phone_number;
}
