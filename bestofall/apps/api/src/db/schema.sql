-- BestOfAll PostgreSQL schema
-- Run via `npm run db:migrate -w apps/api` (see src/db/migrate.ts)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone         VARCHAR(20) UNIQUE NOT NULL,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255),
  avatar_url    TEXT,
  role          VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ---------------------------------------------------------------------------
-- Refresh tokens (for JWT rotation / revocation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ---------------------------------------------------------------------------
-- Saved addresses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label         VARCHAR(60) NOT NULL,
  address_line  TEXT NOT NULL,
  city          VARCHAR(100) NOT NULL,
  state         VARCHAR(100) NOT NULL,
  pincode       VARCHAR(12) NOT NULL,
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  is_default    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ---------------------------------------------------------------------------
-- Wishlist
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id       VARCHAR(200) NOT NULL, -- "platformId:sku"
  item_snapshot JSONB NOT NULL,        -- last known SearchResultItem, for offline display
  added_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);

-- ---------------------------------------------------------------------------
-- Search history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS search_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  query         VARCHAR(300) NOT NULL,
  category      VARCHAR(30),
  result_count  INT NOT NULL DEFAULT 0,
  searched_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_time ON search_history(searched_at);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          VARCHAR(30) NOT NULL,
  title         VARCHAR(200) NOT NULL,
  body          TEXT NOT NULL,
  read          BOOLEAN NOT NULL DEFAULT false,
  meta          JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ---------------------------------------------------------------------------
-- Order redirect / click-through tracking (for admin analytics & platform CTR)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_redirects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  platform_id   VARCHAR(50) NOT NULL,
  item_id       VARCHAR(200) NOT NULL,
  query         VARCHAR(300),
  price         NUMERIC(12, 2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_redirects_platform ON order_redirects(platform_id);
CREATE INDEX IF NOT EXISTS idx_order_redirects_time ON order_redirects(created_at);

-- ---------------------------------------------------------------------------
-- Platform request metrics (for admin dashboard: latency/error rate)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_metrics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_id   VARCHAR(50) NOT NULL,
  latency_ms    INT NOT NULL,
  success       BOOLEAN NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_metrics_platform ON platform_metrics(platform_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_time ON platform_metrics(created_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
