# API Reference

Base URL: `http://localhost:4000/api` (dev) — all responses use the envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

Authenticated routes require `Authorization: Bearer <accessToken>`.

## Auth

| Method | Path                  | Auth | Description |
|--------|-----------------------|------|-------------|
| POST   | `/auth/otp/request`   | —    | Request an OTP for a phone number. Dev mode: OTP is always `123456`. |
| POST   | `/auth/otp/verify`    | —    | Verify OTP (dev mode) or Firebase `idToken` (live mode); `name` required for first-time signup. Returns `{ user, tokens, isNewUser }`. |
| POST   | `/auth/refresh`       | —    | Exchange a refresh token for a new access/refresh pair. |
| GET    | `/auth/me`            | ✅   | Current user profile. |
| PATCH  | `/auth/me`            | ✅   | Update `name` / `email` / `avatarUrl`. |

## Search

| Method | Path              | Auth | Description |
|--------|-------------------|------|-------------|
| GET    | `/search`         | optional | Core aggregation endpoint. See query params below. |
| GET    | `/search/platforms` | —  | Metadata for all integrated platforms. |
| POST   | `/search/redirect`  | optional | Tracks an "Order Now" click-through (for admin CTR analytics). |

**`GET /search` query params:**

| Param | Type | Notes |
|---|---|---|
| `query` | string (required) | Free-text search, e.g. `"pizza"`, `"iphone 16"` |
| `category` | enum | `food \| groceries \| medicines \| electronics \| fashion \| gifts \| other` — inferred from `query` if omitted |
| `sort` | enum | `relevance \| price_low \| price_high \| delivery_fast \| rating_high \| discount_high \| distance_near \| popularity` |
| `page`, `pageSize` | number | Pagination (default page 1, pageSize 20, max 50) |
| `lat`, `lng` | number | User location, enables distance sort/filter |
| `freeDeliveryOnly`, `inStockOnly` | boolean | |
| `minRating`, `minPrice`, `maxPrice` | number | |
| `brands`, `platforms` | comma-separated strings | |

**Response (`data`):** `SearchResponse` — `{ query, category, total, page, pageSize, results[], facets, tookMs, cached }`. See `packages/shared/src/types.ts` for the full `SearchResultItem` shape.

## Wishlist (auth required)

| Method | Path | Description |
|---|---|---|
| GET | `/wishlist` | List saved items |
| POST | `/wishlist` | `{ itemId, item }` — save/update an item |
| DELETE | `/wishlist/:itemId` | Remove an item |

## Search history (auth required)

| Method | Path | Description |
|---|---|---|
| GET | `/history` | Last 50 searches |
| DELETE | `/history` | Clear history |

## Addresses (auth required)

| Method | Path | Description |
|---|---|---|
| GET | `/addresses` | List saved addresses |
| POST | `/addresses` | Create an address `{ label, addressLine, city, state, pincode, lat, lng, isDefault? }` |
| DELETE | `/addresses/:id` | Remove an address |

## Notifications (auth required)

| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | Last 50 notifications |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read-all` | Mark all as read |

## Admin (auth + admin role required)

| Method | Path | Description |
|---|---|---|
| GET | `/admin/overview` | User/search/redirect/latency summary stats |
| GET | `/admin/trending-searches` | Top queries in the last 7 days |
| GET | `/admin/platform-performance` | Per-platform request count, latency, error rate (24h) |
| GET | `/admin/search-trend` | Daily search volume & unique users (14 days) |

## Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request failed schema validation |
| `UNAUTHORIZED` / `INVALID_TOKEN` | 401 | Missing/invalid access token |
| `INVALID_OTP` | 401 | Wrong or expired OTP |
| `NAME_REQUIRED` | 400 | First-time signup missing `name` |
| `FORBIDDEN` | 403 | Admin-only route accessed by a non-admin |
| `RATE_LIMITED` | 429 | Too many requests |
| `NOT_FOUND` | 404 | Unknown route |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
