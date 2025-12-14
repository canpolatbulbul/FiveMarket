-- Migration: Fix services_in_category to use service_id instead of package_id
-- This makes logical sense as a service belongs to categories, not individual packages

-- Drop the existing table
DROP TABLE IF EXISTS services_in_category CASCADE;

-- Recreate with correct schema
CREATE TABLE IF NOT EXISTS services_in_category (
  service_id BIGINT NOT NULL REFERENCES service(service_id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES service_category(category_id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_services_in_category_service ON services_in_category(service_id);
CREATE INDEX IF NOT EXISTS idx_services_in_category_category ON services_in_category(category_id);
