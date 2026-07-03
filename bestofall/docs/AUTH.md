# Authentication

Users sign up/sign in with just a **mobile number, name, and OTP** — no passwords.

## Dev mode (default, `AUTH_DEV_MODE=true`)

- `POST /auth/otp/request { phone }` stores a fixed OTP (`123456`) in Redis for 5 minutes.
- `POST /auth/otp/verify { phone, otp, name? }` checks it against Redis.
- No Firebase project, SMS provider, or billing account required — the entire signup and
  search flow works out of the box for local development and demos.

This is intentional: it lets the whole product (search, wishlist, history, admin
dashboard) be evaluated end-to-end without provisioning external services first.

## Production mode (`AUTH_DEV_MODE=false`)

Phone verification moves to **Firebase Authentication's Phone Auth** provider:

1. **Client** (`apps/web`) integrates the Firebase Web SDK, sets up an invisible reCAPTCHA,
   and calls `signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)`. Firebase sends
   the real SMS OTP.
2. On OTP entry, the client calls `confirmationResult.confirm(otp)`, which returns a
   Firebase **ID token**.
3. **Client** sends that ID token to `POST /auth/otp/verify { phone, idToken, name? }`
   instead of `otp`.
4. **Server** (`services/firebaseAdmin.ts`) verifies the ID token server-side via
   Firebase Admin SDK (`verifyIdToken`), extracts the verified `phone_number` claim, and
   proceeds exactly as in dev mode from there — find-or-create the user, issue BestOfAll's
   own JWT access/refresh tokens.

### Required setup for production mode

1. Create a Firebase project, enable **Phone** sign-in under Authentication providers.
2. Generate a service account key (Project Settings → Service Accounts) and set
   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` in
   `apps/api/.env`.
3. Add the Firebase Web config to `apps/web/.env.local`
   (`NEXT_PUBLIC_FIREBASE_*` variables).
4. Set `AUTH_DEV_MODE=false` in `apps/api/.env`.

## Session tokens

Once phone verification succeeds (either mode), BestOfAll issues its own tokens
(`services/jwtService.ts`) — a short-lived **access token** (15 min default) sent as
`Authorization: Bearer <token>`, and a longer-lived **refresh token** (30 days) the client
stores and exchanges via `POST /auth/refresh` when the access token expires. This keeps
BestOfAll's own session lifecycle independent of Firebase's, and lets `role` (`user` /
`admin`) live in BestOfAll's own database rather than Firebase custom claims.
