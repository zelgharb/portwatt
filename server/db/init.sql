-- PortWatt SME - Schéma de Base PostgreSQL / TimescaleDB
-- Direction d'Exploitation du Port d'Agadir (DEPA)
-- Conforme ISO 50001:2018 & Séries Temporelles

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 1. Table des Postes Électriques
CREATE TABLE IF NOT EXISTS substations (
    id VARCHAR(32) PRIMARY KEY,
    code VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    location_label VARCHAR(256),
    feeder_count INT DEFAULT 0,
    installed_capacity_kva INT DEFAULT 2000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des 58 Points de Comptage
CREATE TABLE IF NOT EXISTS meters (
    id VARCHAR(32) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(256) NOT NULL,
    substation_id VARCHAR(32) REFERENCES substations(id),
    feeder_code VARCHAR(32) NOT NULL,
    usage_category VARCHAR(64) NOT NULL,
    precision_class VARCHAR(16) NOT NULL, -- '0.5S', '0.2S', 'MEIER_CMM61'
    ip_address VARCHAR(45) NOT NULL,
    port INT DEFAULT 502,
    unit_id INT DEFAULT 1,
    ct_ratio_primary INT NOT NULL,
    ct_ratio_secondary INT DEFAULT 5,
    ct_caliber VARCHAR(32) NOT NULL,
    is_existing BOOLEAN DEFAULT FALSE,
    is_submetering BOOLEAN DEFAULT TRUE,
    calibration_due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des Mesures Électriques Haute Fréquence (Hypertable TimescaleDB)
CREATE TABLE IF NOT EXISTS electrical_measurements (
    time TIMESTAMPTZ NOT NULL,
    meter_id VARCHAR(32) NOT NULL,
    substation_id VARCHAR(32) NOT NULL,
    voltage_ph_ph NUMERIC(6, 2),
    voltage_ph_n NUMERIC(6, 2),
    current_avg NUMERIC(7, 2),
    active_power_kw NUMERIC(8, 2),
    reactive_power_kvar NUMERIC(8, 2),
    apparent_power_kva NUMERIC(8, 2),
    power_factor NUMERIC(4, 3),
    active_energy_kwh NUMERIC(14, 2),
    reactive_energy_kvarh NUMERIC(14, 2),
    thd_u NUMERIC(4, 2),
    thd_i NUMERIC(5, 2),
    frequency NUMERIC(5, 2),
    freshness VARCHAR(16) DEFAULT 'LIVE'
);

-- Conversion en Hypertable TimescaleDB partitionnée par tranche temporelle de 1 jour
SELECT create_hypertable('electrical_measurements', 'time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '1 day');

-- Index d'optimisation ISO 50001
CREATE INDEX IF NOT EXISTS idx_meas_meter_time ON electrical_measurements (meter_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_meas_sub_time ON electrical_measurements (substation_id, time DESC);

-- 4. Table des Alertes & Événements Qualité
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL,
    title VARCHAR(256) NOT NULL,
    description TEXT,
    severity VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'NEW',
    substation_id VARCHAR(32) REFERENCES substations(id),
    meter_id VARCHAR(32) REFERENCES meters(id),
    value_recorded VARCHAR(64),
    threshold VARCHAR(64),
    acknowledged_by VARCHAR(128),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Journal d'Audit Horodaté (ISO 50001 §9.2)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_name VARCHAR(128) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target VARCHAR(128) NOT NULL,
    details TEXT
);
