-- ============================================================================
-- FiveMarket Database Schema
-- ============================================================================
-- This file creates schema only; data seeding happens elsewhere.
-- Idempotent: safe to run multiple times.
-- Note: userID uses camelCase (quoted), all other columns use snake_case
-- ============================================================================

-- Create updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Core User Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS "user" (
  "userID" BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT email_format CHECK (position('@' IN email) > 1)
);

CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

DROP TRIGGER IF EXISTS trg_user_updated_at ON "user";
CREATE TRIGGER trg_user_updated_at
  BEFORE UPDATE ON "user"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- User Role Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS client (
  "userID" BIGINT PRIMARY KEY REFERENCES "user"("userID") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_client_user_id ON client("userID");

CREATE TABLE IF NOT EXISTS freelancer (
  "userID" BIGINT PRIMARY KEY REFERENCES "user"("userID") ON DELETE CASCADE,
  total_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT total_earned_non_negative CHECK (total_earned >= 0)
);

CREATE INDEX IF NOT EXISTS idx_freelancer_user_id ON freelancer("userID");

CREATE TABLE IF NOT EXISTS administrator (
  "userID" BIGINT PRIMARY KEY REFERENCES "user"("userID") ON DELETE CASCADE,
  role_level INT NOT NULL,
  hired_at DATE NOT NULL,
  CONSTRAINT role_level_range CHECK (role_level BETWEEN 1 AND 10)
);

CREATE INDEX IF NOT EXISTS idx_administrator_user_id ON administrator("userID");

-- ============================================================================
-- Skills & Certification
-- ============================================================================

CREATE TABLE IF NOT EXISTS skill_exam (
  exam_id BIGSERIAL PRIMARY KEY,
  skill_topic VARCHAR(100) NOT NULL,
  result VARCHAR(50),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_exam_topic ON skill_exam(skill_topic);

DROP TRIGGER IF EXISTS trg_skill_exam_updated_at ON skill_exam;
CREATE TRIGGER trg_skill_exam_updated_at
  BEFORE UPDATE ON skill_exam
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS certificate (
  certificate_id BIGSERIAL PRIMARY KEY,
  issued_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_certificate_updated_at ON certificate;
CREATE TRIGGER trg_certificate_updated_at
  BEFORE UPDATE ON certificate
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS skill_certification (
  certificate_id BIGINT PRIMARY KEY REFERENCES certificate(certificate_id) ON DELETE CASCADE,
  "userID" BIGINT NOT NULL REFERENCES "user"("userID") ON DELETE CASCADE,
  exam_id BIGINT NOT NULL REFERENCES skill_exam(exam_id) ON DELETE CASCADE,
  CONSTRAINT unique_user_exam UNIQUE ("userID", exam_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_cert_user ON skill_certification("userID");
CREATE INDEX IF NOT EXISTS idx_skill_cert_exam ON skill_certification(exam_id);

CREATE TABLE IF NOT EXISTS test_attempt (
  attempt_id BIGSERIAL PRIMARY KEY,
  freelancer_id BIGINT NOT NULL REFERENCES freelancer("userID") ON DELETE CASCADE,
  exam_id BIGINT NOT NULL REFERENCES skill_exam(exam_id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score_percent NUMERIC(5,2),
  passed BOOLEAN NOT NULL DEFAULT false,
  answers_blob JSONB,
  CONSTRAINT score_range CHECK (score_percent >= 0 AND score_percent <= 100)
);

CREATE INDEX IF NOT EXISTS idx_test_attempt_freelancer ON test_attempt(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_test_attempt_exam ON test_attempt(exam_id);

-- ============================================================================
-- Services & Packages
-- ============================================================================

CREATE TABLE IF NOT EXISTS service (
  service_id BIGSERIAL PRIMARY KEY,
  freelancer_id BIGINT NOT NULL REFERENCES freelancer("userID") ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_freelancer ON service(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_service_title ON service(title);

DROP TRIGGER IF EXISTS trg_service_updated_at ON service;
CREATE TRIGGER trg_service_updated_at
  BEFORE UPDATE ON service
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS package (
  package_id BIGSERIAL PRIMARY KEY,
  service_id BIGINT NOT NULL REFERENCES service(service_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  delivery_time INT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT price_non_negative CHECK (price >= 0),
  CONSTRAINT delivery_time_positive CHECK (delivery_time > 0),
  CONSTRAINT unique_package_per_service UNIQUE (service_id, name)
);

CREATE INDEX IF NOT EXISTS idx_package_service ON package(service_id);

DROP TRIGGER IF EXISTS trg_package_updated_at ON package;
CREATE TRIGGER trg_package_updated_at
  BEFORE UPDATE ON package
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS service_category (
  category_id BIGSERIAL PRIMARY KEY,
  total_customers INT NOT NULL DEFAULT 0,
  description VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT total_customers_non_negative CHECK (total_customers >= 0)
);

DROP TRIGGER IF EXISTS trg_service_category_updated_at ON service_category;
CREATE TRIGGER trg_service_category_updated_at
  BEFORE UPDATE ON service_category
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS services_in_category (
  package_id BIGINT NOT NULL REFERENCES package(package_id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES service_category(category_id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_services_in_category_package ON services_in_category(package_id);
CREATE INDEX IF NOT EXISTS idx_services_in_category_category ON services_in_category(category_id);

-- ============================================================================
-- Orders & Transactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS "order" (
  order_id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES client("userID") ON DELETE RESTRICT,
  package_id BIGINT NOT NULL REFERENCES package(package_id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL,
  placed_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_time TIMESTAMPTZ NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  progress VARCHAR(50) NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT status_values CHECK (status IN ('submitted','in_progress','delivered','completed','cancelled','disputed')),
  CONSTRAINT total_price_non_negative CHECK (total_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_client ON "order"(client_id);
CREATE INDEX IF NOT EXISTS idx_order_package ON "order"(package_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status);

DROP TRIGGER IF EXISTS trg_order_updated_at ON "order";
CREATE TRIGGER trg_order_updated_at
  BEFORE UPDATE ON "order"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS money_transaction (
  transaction_id BIGSERIAL PRIMARY KEY,
  amount NUMERIC(10,2) NOT NULL,
  receiver_iban VARCHAR(34) NOT NULL,
  sender_iban VARCHAR(34) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_money_transaction_receiver ON money_transaction(receiver_iban);
CREATE INDEX IF NOT EXISTS idx_money_transaction_sender ON money_transaction(sender_iban);

DROP TRIGGER IF EXISTS trg_money_transaction_updated_at ON money_transaction;
CREATE TRIGGER trg_money_transaction_updated_at
  BEFORE UPDATE ON money_transaction
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS client_transaction (
  transaction_id BIGINT PRIMARY KEY REFERENCES money_transaction(transaction_id) ON DELETE CASCADE,
  client_id BIGINT NOT NULL REFERENCES client("userID") ON DELETE RESTRICT,
  freelancer_id BIGINT NOT NULL REFERENCES freelancer("userID") ON DELETE RESTRICT,
  CONSTRAINT different_parties CHECK (client_id <> freelancer_id)
);

CREATE INDEX IF NOT EXISTS idx_client_transaction_client ON client_transaction(client_id);
CREATE INDEX IF NOT EXISTS idx_client_transaction_freelancer ON client_transaction(freelancer_id);

CREATE TABLE IF NOT EXISTS belongs_to_order (
  order_id BIGINT NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
  transaction_id BIGINT NOT NULL REFERENCES money_transaction(transaction_id) ON DELETE CASCADE,
  PRIMARY KEY (order_id, transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_belongs_to_order_order ON belongs_to_order(order_id);
CREATE INDEX IF NOT EXISTS idx_belongs_to_order_transaction ON belongs_to_order(transaction_id);

-- ============================================================================
-- Communication
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation (
  conversation_id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversation_order ON conversation(order_id);

DROP TRIGGER IF EXISTS trg_conversation_updated_at ON conversation;
CREATE TRIGGER trg_conversation_updated_at
  BEFORE UPDATE ON conversation
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS message (
  conversation_id BIGINT NOT NULL REFERENCES conversation(conversation_id) ON DELETE CASCADE,
  message_no INT NOT NULL,
  sender_user_id BIGINT NOT NULL REFERENCES "user"("userID") ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  seen_status BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, message_no)
);

CREATE INDEX IF NOT EXISTS idx_message_sender ON message(sender_user_id);

-- ============================================================================
-- Reviews & Revisions
-- ============================================================================

CREATE TABLE IF NOT EXISTS revision_request (
  revision_id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  request_status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT request_status_values CHECK (request_status IN ('requested','accepted','rejected','fulfilled'))
);

CREATE INDEX IF NOT EXISTS idx_revision_request_order ON revision_request(order_id);
CREATE INDEX IF NOT EXISTS idx_revision_request_status ON revision_request(request_status);

DROP TRIGGER IF EXISTS trg_revision_request_updated_at ON revision_request;
CREATE TRIGGER trg_revision_request_updated_at
  BEFORE UPDATE ON revision_request
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS review (
  review_id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL UNIQUE REFERENCES "order"(order_id) ON DELETE CASCADE,
  rating INT NOT NULL,
  comment TEXT,
  submit_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rating_range CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS idx_review_order ON review(order_id);

DROP TRIGGER IF EXISTS trg_review_updated_at ON review;
CREATE TRIGGER trg_review_updated_at
  BEFORE UPDATE ON review
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Disputes & Support
-- ============================================================================

CREATE TABLE IF NOT EXISTS dispute_resolution (
  dispute_id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES service_category(category_id) ON DELETE SET NULL,
  creation_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dispute_status_values CHECK (status IN ('open','under_review','resolved','rejected'))
);

CREATE INDEX IF NOT EXISTS idx_dispute_order ON dispute_resolution(order_id);
CREATE INDEX IF NOT EXISTS idx_dispute_status ON dispute_resolution(status);

DROP TRIGGER IF EXISTS trg_dispute_resolution_updated_at ON dispute_resolution;
CREATE TRIGGER trg_dispute_resolution_updated_at
  BEFORE UPDATE ON dispute_resolution
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS support_ticket (
  ticket_id BIGSERIAL PRIMARY KEY,
  "userID" BIGINT NOT NULL REFERENCES "user"("userID") ON DELETE CASCADE,
  admin_id BIGINT REFERENCES administrator("userID") ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ticket_status_values CHECK (status IN ('open','assigned','waiting_user','waiting_admin','closed'))
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_user ON support_ticket("userID");
CREATE INDEX IF NOT EXISTS idx_support_ticket_admin ON support_ticket(admin_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_status ON support_ticket(status);

DROP TRIGGER IF EXISTS trg_support_ticket_updated_at ON support_ticket;
CREATE TRIGGER trg_support_ticket_updated_at
  BEFORE UPDATE ON support_ticket
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS ticket_message (
  ticket_id BIGINT NOT NULL REFERENCES support_ticket(ticket_id) ON DELETE CASCADE,
  message_no INT NOT NULL,
  sender_user_id BIGINT NOT NULL REFERENCES "user"("userID") ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (ticket_id, message_no)
);

CREATE INDEX IF NOT EXISTS idx_ticket_message_sender ON ticket_message(sender_user_id);

-- ============================================================================
-- Admin & Reporting
-- ============================================================================

CREATE TABLE IF NOT EXISTS report (
  report_id BIGSERIAL PRIMARY KEY,
  admin_id BIGINT NOT NULL REFERENCES administrator("userID") ON DELETE RESTRICT,
  generation_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  parameter VARCHAR(255),
  report_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_admin ON report(admin_id);
CREATE INDEX IF NOT EXISTS idx_report_type ON report(report_type);

DROP TRIGGER IF EXISTS trg_report_updated_at ON report;
CREATE TRIGGER trg_report_updated_at
  BEFORE UPDATE ON report
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Portfolio Images
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_image (
  image_id BIGSERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES service(service_id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_service_order UNIQUE(service_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_service ON portfolio_image(service_id);
