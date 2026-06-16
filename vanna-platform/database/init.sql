-- ============================================================
-- Vanna AI Platform — Database Schema Initialization
-- PostgreSQL 15+
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user', 'api_consumer');
CREATE TYPE database_type AS ENUM ('postgresql', 'mysql', 'mariadb', 'mssql', 'oracle', 'mongodb');
CREATE TYPE ssl_mode AS ENUM ('disable', 'require', 'verify-ca', 'verify-full');
CREATE TYPE token_status AS ENUM ('active', 'revoked', 'expired');
CREATE TYPE audit_action AS ENUM (
    'user_login', 'user_logout', 'user_register', 'login_failed', 'password_changed',
    'user_created', 'user_updated', 'user_deleted', 'user_deactivated',
    'profile_created', 'profile_updated', 'profile_deleted', 'profile_tested', 'schema_ingested',
    'token_created', 'token_revoked', 'token_rotated', 'token_validated',
    'query_executed', 'query_failed', 'query_blocked'
);

-- ── Users ─────────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(100) NOT NULL UNIQUE,
    full_name       VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    role            user_role    NOT NULL DEFAULT 'user',
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role     ON users(role);

-- Default super_admin (password: Admin@ONGC123)
INSERT INTO users (email, username, full_name, hashed_password, role, is_active, is_verified)
VALUES (
    'admin@vanna-platform.local',
    'superadmin',
    'Super Administrator',
    '$2b$12$UthnnsidsyXulNTF1D4zuOcS1/5L2ZCnvs8yclUZOqNt2.onzyCE6',
    'super_admin',
    TRUE,
    TRUE
);

-- ── Connection Profiles ───────────────────────────────────────────────────────

CREATE TABLE connection_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id            UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name        VARCHAR(255) NOT NULL,
    description         TEXT,
    db_type             database_type NOT NULL,
    host                VARCHAR(255) NOT NULL,
    port                INTEGER      NOT NULL,
    database_name       VARCHAR(255) NOT NULL,
    username            VARCHAR(255) NOT NULL,
    encrypted_password  TEXT         NOT NULL,
    ssl_mode            ssl_mode     NOT NULL DEFAULT 'disable',
    ssl_ca_cert         TEXT,
    ssl_client_cert     TEXT,
    ssl_client_key      TEXT,
    allowed_schemas     JSONB        NOT NULL DEFAULT '[]',
    allowed_tables      JSONB        NOT NULL DEFAULT '[]',
    read_only           BOOLEAN      NOT NULL DEFAULT TRUE,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    last_tested_at      TIMESTAMPTZ,
    last_test_success   BOOLEAN,
    schema_ingested_at  TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_owner ON connection_profiles(owner_id);
CREATE INDEX idx_profiles_type  ON connection_profiles(db_type);

-- ── API Tokens ────────────────────────────────────────────────────────────────

CREATE TABLE api_tokens (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id                UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id              UUID         NOT NULL REFERENCES connection_profiles(id) ON DELETE CASCADE,
    name                    VARCHAR(255) NOT NULL,
    description             TEXT,
    token_hash              CHAR(64)     NOT NULL UNIQUE,   -- SHA-256 hex
    permissions             JSONB        NOT NULL DEFAULT '["query"]',
    allowed_schemas         JSONB        NOT NULL DEFAULT '[]',
    allowed_tables          JSONB        NOT NULL DEFAULT '[]',
    status                  token_status NOT NULL DEFAULT 'active',
    expires_at              TIMESTAMPTZ,
    revoked_at              TIMESTAMPTZ,
    rate_limit_per_minute   INTEGER      NOT NULL DEFAULT 60,
    total_requests          BIGINT       NOT NULL DEFAULT 0,
    last_used_at            TIMESTAMPTZ,
    last_used_ip            VARCHAR(45),
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tokens_hash    ON api_tokens(token_hash);
CREATE INDEX idx_tokens_owner   ON api_tokens(owner_id);
CREATE INDEX idx_tokens_profile ON api_tokens(profile_id);
CREATE INDEX idx_tokens_status  ON api_tokens(status);

-- ── Query History ─────────────────────────────────────────────────────────────

CREATE TABLE query_history (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id                UUID    REFERENCES api_tokens(id) ON DELETE SET NULL,
    profile_id              UUID    REFERENCES connection_profiles(id) ON DELETE SET NULL,
    user_id                 UUID    REFERENCES users(id) ON DELETE SET NULL,
    natural_language_query  TEXT    NOT NULL,
    generated_sql           TEXT,
    sql_explanation         TEXT,
    response_summary        TEXT,
    status                  VARCHAR(20) NOT NULL,   -- success | failed | blocked
    error_message           TEXT,
    row_count               INTEGER,
    execution_time_ms       FLOAT,
    ip_address              VARCHAR(45),
    user_agent              TEXT,
    db_type                 VARCHAR(50),
    page                    INTEGER DEFAULT 1,
    page_size               INTEGER DEFAULT 100,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qh_token      ON query_history(token_id);
CREATE INDEX idx_qh_profile    ON query_history(profile_id);
CREATE INDEX idx_qh_user       ON query_history(user_id);
CREATE INDEX idx_qh_status     ON query_history(status);
CREATE INDEX idx_qh_created    ON query_history(created_at DESC);
CREATE INDEX idx_qh_db_type    ON query_history(db_type);

-- ── Audit Logs ────────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID    REFERENCES users(id) ON DELETE SET NULL,
    action        audit_action NOT NULL,
    resource_type VARCHAR(100),
    resource_id   VARCHAR(255),
    ip_address    VARCHAR(45),
    user_agent    TEXT,
    details       JSONB   NOT NULL DEFAULT '{}',
    status        VARCHAR(20) NOT NULL DEFAULT 'success',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user    ON audit_logs(user_id);
CREATE INDEX idx_audit_action  ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_ip      ON audit_logs(ip_address);

-- ── Schema Metadata ───────────────────────────────────────────────────────────

CREATE TABLE schema_metadata (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id          UUID NOT NULL REFERENCES connection_profiles(id) ON DELETE CASCADE,
    schema_name         VARCHAR(255),
    table_name          VARCHAR(255) NOT NULL,
    column_definitions  JSONB NOT NULL DEFAULT '{}',
    relationships       JSONB NOT NULL DEFAULT '{}',
    sample_values       JSONB NOT NULL DEFAULT '{}',
    description         TEXT,
    is_manually_corrected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, table_name)
);

CREATE INDEX idx_schema_profile ON schema_metadata(profile_id);

-- ── Business Glossary ─────────────────────────────────────────────────────────

CREATE TABLE business_glossary (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id      UUID NOT NULL REFERENCES connection_profiles(id) ON DELETE CASCADE,
    term            VARCHAR(255) NOT NULL,
    definition      TEXT,
    maps_to_table   VARCHAR(255),
    maps_to_column  VARCHAR(255),
    synonyms        JSONB NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_glossary_profile ON business_glossary(profile_id);

-- ── Updated-at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated
    BEFORE UPDATE ON connection_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tokens_updated
    BEFORE UPDATE ON api_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_schema_updated
    BEFORE UPDATE ON schema_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Schema initialization complete.
-- Default super_admin: admin@vanna-platform.local / Admin@ONGC123
-- IMPORTANT: Change the default password immediately after first login.
-- ============================================================
