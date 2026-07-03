import { Router } from 'express';
import { z } from 'zod';
import { AuthResponse } from '@bestofall/shared';
import { asyncHandler } from '../utils/asyncHandler';
import { otpRateLimiter } from '../middleware/rateLimiter';
import { sendDevOtp, verifyDevOtp } from '../services/devOtpService';
import { verifyFirebaseIdToken } from '../services/firebaseAdmin';
import { issueTokens, verifyRefreshToken } from '../services/jwtService';
import { createUser, findUserByPhone, findUserById, updateUserProfile } from '../repositories/userRepository';
import { env } from '../config/env';
import { ApiHttpError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid phone number with country code');

const requestOtpSchema = z.object({ phone: phoneSchema });
authRouter.post(
  '/otp/request',
  otpRateLimiter,
  asyncHandler(async (req, res) => {
    const { phone } = requestOtpSchema.parse(req.body);

    if (env.authDevMode) {
      await sendDevOtp(phone);
      return res.json({
        success: true,
        data: { message: 'OTP sent (dev mode: use 123456)', devMode: true },
      });
    }

    // In production, OTP delivery happens client-side via Firebase Phone
    // Auth (reCAPTCHA + signInWithPhoneNumber). This endpoint exists so the
    // client has one consistent "request OTP" call regardless of mode; in
    // live mode it's a no-op acknowledgement.
    res.json({ success: true, data: { message: 'Proceed with Firebase phone sign-in on the client', devMode: false } });
  })
);

const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().optional(),
  idToken: z.string().optional(),
  name: z.string().min(2).max(120).optional(),
});

authRouter.post(
  '/otp/verify',
  otpRateLimiter,
  asyncHandler(async (req, res) => {
    const body = verifyOtpSchema.parse(req.body);
    let verifiedPhone: string;

    if (env.authDevMode) {
      if (!body.otp) throw new ApiHttpError(400, 'VALIDATION_ERROR', 'otp is required in dev mode');
      const ok = await verifyDevOtp(body.phone, body.otp);
      if (!ok) throw new ApiHttpError(401, 'INVALID_OTP', 'Incorrect or expired OTP');
      verifiedPhone = body.phone;
    } else {
      if (!body.idToken) throw new ApiHttpError(400, 'VALIDATION_ERROR', 'idToken is required');
      verifiedPhone = await verifyFirebaseIdToken(body.idToken);
    }

    let user = await findUserByPhone(verifiedPhone);
    let isNewUser = false;

    if (!user) {
      if (!body.name) {
        throw new ApiHttpError(400, 'NAME_REQUIRED', 'Name is required for first-time signup');
      }
      user = await createUser(verifiedPhone, body.name);
      isNewUser = true;
    }

    const tokens = issueTokens(user);
    const response: AuthResponse = { user, tokens, isNewUser };
    res.json({ success: true, data: response });
  })
);

const refreshSchema = z.object({ refreshToken: z.string() });
authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiHttpError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token invalid or expired');
    }
    const user = await findUserById(payload.sub);
    if (!user) throw new ApiHttpError(401, 'USER_NOT_FOUND', 'User no longer exists');
    const tokens = issueTokens(user);
    res.json({ success: true, data: { tokens } });
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.auth!.sub);
    if (!user) throw new ApiHttpError(404, 'USER_NOT_FOUND', 'User not found');
    res.json({ success: true, data: user });
  })
);

const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

authRouter.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const updates = updateProfileSchema.parse(req.body);
    const user = await updateUserProfile(req.auth!.sub, updates);
    res.json({ success: true, data: user });
  })
);
