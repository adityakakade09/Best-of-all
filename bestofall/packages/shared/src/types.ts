/**
 * BestOfAll — Shared domain types
 * Consumed by both apps/api (backend) and apps/web (frontend) so the
 * search/comparison contract never drifts between the two.
 */

// ---------------------------------------------------------------------------
// Categories & Platforms
// ---------------------------------------------------------------------------

export type Category =
  | 'food'
  | 'groceries'
  | 'medicines'
  | 'electronics'
  | 'fashion'
  | 'gifts'
  | 'other';

export type PlatformType = 'food_delivery' | 'quick_commerce' | 'ecommerce' | 'pharmacy';

export interface PlatformMeta {
  id: string; // e.g. "amazon", "swiggy"
  name: string; // Display name
  type: PlatformType;
  categories: Category[];
  logo: string; // path/URL to logo asset
  color: string; // brand hex, used for badges
  /** true if we talk to a real/official API; false if this is a modelled mock provider */
  hasOfficialIntegration: boolean;
  affiliateBaseUrl?: string;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface SearchRequest {
  query: string;
  category?: Category;
  location?: GeoPoint;
  page?: number;
  pageSize?: number;
  filters?: SearchFilters;
  sort?: SortOption;
}

export type SortOption =
  | 'relevance'
  | 'price_low'
  | 'price_high'
  | 'delivery_fast'
  | 'rating_high'
  | 'discount_high'
  | 'distance_near'
  | 'popularity';

export interface SearchFilters {
  freeDeliveryOnly?: boolean;
  inStockOnly?: boolean;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  brands?: string[];
  platforms?: string[];
  categories?: Category[];
}

export interface SearchResultItem {
  id: string; // stable id: `${platformId}:${sku}`
  platformId: string;
  platformName: string;
  category: Category;
  title: string;
  description?: string;
  image: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  currency: 'INR';
  deliveryFee: number;
  freeDeliveryEligible: boolean;
  etaMinutes: number; // estimated delivery time in minutes
  rating: number; // 0-5
  ratingCount: number;
  distanceKm?: number;
  inStock: boolean;
  popularityScore: number; // 0-100, used for "popularity" sort & recommendations
  signalScore: number; // 0-100 composite BestOfAll score (see scoring.ts)
  deepLink: string; // URL that "Order Now" redirects to
  badges?: ResultBadge[];
}

export type ResultBadge =
  | 'best_overall'
  | 'lowest_price'
  | 'fastest_delivery'
  | 'top_rated'
  | 'biggest_discount'
  | 'free_delivery'
  | 'nearest';

export interface SearchResponse {
  query: string;
  category: Category;
  total: number;
  page: number;
  pageSize: number;
  results: SearchResultItem[];
  facets: SearchFacets;
  tookMs: number;
  cached: boolean;
}

export interface SearchFacets {
  brands: { value: string; count: number }[];
  platforms: { value: string; count: number }[];
  priceRange: { min: number; max: number };
}

// ---------------------------------------------------------------------------
// Auth & Users
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  phone: string; // E.164
  name: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  role: 'user' | 'admin';
}

export interface OtpRequestPayload {
  phone: string;
}

export interface OtpVerifyPayload {
  phone: string;
  otp: string;
  name?: string; // required on first signup
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  isNewUser: boolean;
}

// ---------------------------------------------------------------------------
// User data: addresses, wishlist, history, notifications
// ---------------------------------------------------------------------------

export interface SavedAddress {
  id: string;
  label: string; // "Home", "Work", ...
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  location: GeoPoint;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string;
  userId: string;
  item: SearchResultItem;
  addedAt: string;
}

export interface SearchHistoryEntry {
  id: string;
  userId: string;
  query: string;
  category?: Category;
  searchedAt: string;
  resultCount: number;
}

export type NotificationType = 'price_drop' | 'back_in_stock' | 'order_update' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  meta?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Admin / Analytics
// ---------------------------------------------------------------------------

export interface AdminOverviewStats {
  totalUsers: number;
  newUsersToday: number;
  totalSearches: number;
  searchesToday: number;
  totalOrderRedirects: number;
  activePlatforms: number;
  avgResponseTimeMs: number;
}

export interface TrendingSearchEntry {
  query: string;
  count: number;
  category: Category;
}

export interface PlatformPerformance {
  platformId: string;
  platformName: string;
  requestCount: number;
  avgLatencyMs: number;
  errorRate: number;
  clickThroughRate: number;
}

export interface SearchTrendPoint {
  date: string; // ISO date
  searches: number;
  uniqueUsers: number;
}

// ---------------------------------------------------------------------------
// API envelope
// ---------------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
