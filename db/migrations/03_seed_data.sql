-- ============================================================================
-- FiveMarket Database Seed Data
-- ============================================================================
-- Comprehensive seed data for all tables
-- Run after schema migrations
-- ============================================================================

-- Clear existing data (in reverse dependency order)
TRUNCATE TABLE ticket_message CASCADE;
TRUNCATE TABLE support_ticket CASCADE;
TRUNCATE TABLE report CASCADE;
TRUNCATE TABLE dispute_resolution CASCADE;
TRUNCATE TABLE review CASCADE;
TRUNCATE TABLE revision_request CASCADE;
TRUNCATE TABLE message CASCADE;
TRUNCATE TABLE conversation CASCADE;
TRUNCATE TABLE belongs_to_order CASCADE;
TRUNCATE TABLE client_transaction CASCADE;
TRUNCATE TABLE money_transaction CASCADE;
TRUNCATE TABLE "order" CASCADE;
TRUNCATE TABLE services_in_category CASCADE;
TRUNCATE TABLE service_category CASCADE;
TRUNCATE TABLE package CASCADE;
TRUNCATE TABLE service CASCADE;
TRUNCATE TABLE test_attempt CASCADE;
TRUNCATE TABLE skill_certification CASCADE;
TRUNCATE TABLE certificate CASCADE;
TRUNCATE TABLE skill_exam CASCADE;
TRUNCATE TABLE administrator CASCADE;
TRUNCATE TABLE freelancer CASCADE;
TRUNCATE TABLE client CASCADE;
TRUNCATE TABLE "user" CASCADE;

-- Reset sequences to start after seed data
ALTER SEQUENCE "user_userID_seq" RESTART WITH 23;
ALTER SEQUENCE service_service_id_seq RESTART WITH 17;
ALTER SEQUENCE package_package_id_seq RESTART WITH 49;
ALTER SEQUENCE service_category_category_id_seq RESTART WITH 11;
ALTER SEQUENCE order_order_id_seq RESTART WITH 11;
ALTER SEQUENCE money_transaction_transaction_id_seq RESTART WITH 5;
ALTER SEQUENCE conversation_conversation_id_seq RESTART WITH 1;
ALTER SEQUENCE revision_request_revision_id_seq RESTART WITH 1;
ALTER SEQUENCE review_review_id_seq RESTART WITH 1;
ALTER SEQUENCE dispute_resolution_dispute_id_seq RESTART WITH 1;
ALTER SEQUENCE support_ticket_ticket_id_seq RESTART WITH 1;
ALTER SEQUENCE report_report_id_seq RESTART WITH 1;
ALTER SEQUENCE skill_exam_exam_id_seq RESTART WITH 1;
ALTER SEQUENCE certificate_certificate_id_seq RESTART WITH 1;
ALTER SEQUENCE test_attempt_attempt_id_seq RESTART WITH 1;

-- ============================================================================
-- Users (password is 'password123' hashed with bcryptjs)
-- ============================================================================

INSERT INTO "user" ("userID", first_name, last_name, email, password) VALUES
-- Clients (1-5)
(1, 'John', 'Smith', 'john.smith@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(2, 'Sarah', 'Johnson', 'sarah.j@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(3, 'Michael', 'Brown', 'michael.b@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(4, 'Emily', 'Davis', 'emily.davis@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(5, 'David', 'Wilson', 'david.w@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),

-- Freelancers (6-20)
(6, 'Alex', 'Martinez', 'alex.design@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(7, 'Jessica', 'Taylor', 'jessica.dev@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(8, 'Ryan', 'Anderson', 'ryan.writer@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(9, 'Sophia', 'Thomas', 'sophia.video@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(10, 'Daniel', 'Moore', 'daniel.marketing@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(11, 'Olivia', 'Jackson', 'olivia.graphics@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(12, 'Ethan', 'White', 'ethan.code@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(13, 'Ava', 'Harris', 'ava.content@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(14, 'Noah', 'Martin', 'noah.music@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(15, 'Isabella', 'Garcia', 'isabella.translate@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(16, 'James', 'Rodriguez', 'james.animation@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(17, 'Mia', 'Lee', 'mia.social@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(18, 'Lucas', 'Walker', 'lucas.seo@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(19, 'Charlotte', 'Hall', 'charlotte.voice@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(20, 'Benjamin', 'Allen', 'benjamin.data@example.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),

-- Admins (21-22)
(21, 'Admin', 'User', 'admin@fivemarket.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu'),
(22, 'Super', 'Admin', 'superadmin@fivemarket.com', '$2b$10$v9IYreiDLejRytAyPSGH6uLWKbQaUpDYlI1UBVGB1DkOZiQoHuTZu');

-- ============================================================================
-- User Roles
-- ============================================================================

INSERT INTO client ("userID") VALUES (1), (2), (3), (4), (5);

INSERT INTO freelancer ("userID", total_earned) VALUES
(6, 15420.50),
(7, 28750.00),
(8, 12300.75),
(9, 19850.00),
(10, 22100.25),
(11, 31200.00),
(12, 18900.50),
(13, 14500.00),
(14, 9800.75),
(15, 16700.00),
(16, 21400.50),
(17, 13900.25),
(18, 17600.00),
(19, 11200.75),
(20, 24300.00);

INSERT INTO administrator ("userID", hired_at) VALUES
(21, '2023-01-15'),
(22, '2022-06-01');

-- ============================================================================
-- Service Categories
-- ============================================================================

INSERT INTO service_category (category_id, total_customers, description) VALUES
(1, 2500, 'Graphics & Design'),
(2, 1800, 'Digital Marketing'),
(3, 1200, 'Writing & Translation'),
(4, 900, 'Video & Animation'),
(5, 3100, 'Programming & Tech'),
(6, 600, 'Music & Audio'),
(7, 1500, 'Business'),
(8, 800, 'AI Services'),
(9, 1100, 'Photography'),
(10, 950, 'Lifestyle');

-- ============================================================================
-- Services & Packages
-- ============================================================================

-- Logo Design Services
INSERT INTO service (service_id, freelancer_id, title, description) VALUES
(1, 6, 'Professional Logo Design', 'I will create a unique, modern logo for your brand. With 5+ years of experience, I specialize in minimalist and corporate designs.'),
(2, 11, 'Minimalist Logo & Brand Identity', 'Get a complete brand identity package including logo, color palette, and typography guidelines.'),

-- Web Development
(3, 7, 'Full-Stack Web Application Development', 'Expert in React, Node.js, and PostgreSQL. I will build your custom web application from scratch.'),
(4, 12, 'WordPress Website Development', 'Professional WordPress sites with custom themes, plugins, and SEO optimization.'),

-- Content Writing
(5, 8, 'SEO Blog Posts & Articles', 'Engaging, SEO-optimized content that ranks. 1000+ articles written for various niches.'),
(6, 13, 'Professional Copywriting Services', 'Compelling copy for websites, ads, and marketing materials that convert.'),

-- Video Editing
(7, 9, 'Professional Video Editing', 'High-quality video editing for YouTube, social media, and corporate videos.'),
(8, 16, '2D Animation & Motion Graphics', 'Eye-catching animations for explainer videos, ads, and social media content.'),

-- Digital Marketing
(9, 10, 'Social Media Marketing Strategy', 'Complete social media strategy and management for Instagram, Facebook, and LinkedIn.'),
(10, 17, 'Facebook & Instagram Ads Management', 'ROI-focused ad campaigns with proven results. Managed $500K+ in ad spend.'),

-- Programming
(11, 12, 'Python Automation Scripts', 'Custom Python scripts for data processing, web scraping, and task automation.'),
(12, 20, 'Data Analysis & Visualization', 'Transform your data into actionable insights with Python, R, and Tableau.'),

-- Music & Audio
(13, 14, 'Music Production & Mixing', 'Professional music production, mixing, and mastering for all genres.'),
(14, 19, 'Voice Over Recording', 'Professional voice over for commercials, audiobooks, and explainer videos.'),

-- Translation
(15, 15, 'English to Spanish Translation', 'Native Spanish speaker with 10+ years of translation experience.'),

-- SEO
(16, 18, 'Complete SEO Optimization', 'On-page and off-page SEO to boost your website rankings and organic traffic.');

-- Packages for each service
INSERT INTO package (package_id, service_id, name, description, price, delivery_time) VALUES
-- Logo Design (Service 1)
(1, 1, 'Basic', '1 logo concept, 2 revisions, source files', 50.00, 3),
(2, 1, 'Standard', '3 logo concepts, 5 revisions, source files, social media kit', 150.00, 5),
(3, 1, 'Premium', '5 logo concepts, unlimited revisions, full brand guidelines', 300.00, 7),

-- Logo Design (Service 2)
(4, 2, 'Basic', 'Logo design with 3 revisions', 75.00, 3),
(5, 2, 'Standard', 'Logo + business card design', 200.00, 5),
(6, 2, 'Premium', 'Complete brand identity package', 500.00, 10),

-- Web Development (Service 3)
(7, 3, 'Basic', 'Simple landing page (5 sections)', 400.00, 5),
(8, 3, 'Standard', 'Multi-page website with CMS', 1200.00, 10),
(9, 3, 'Premium', 'Full-stack web application', 3000.00, 21),

-- WordPress (Service 4)
(10, 4, 'Basic', 'Basic WordPress site (5 pages)', 300.00, 5),
(11, 4, 'Standard', 'Custom theme + plugins (10 pages)', 800.00, 10),
(12, 4, 'Premium', 'E-commerce WordPress site', 1500.00, 14),

-- Content Writing (Service 5)
(13, 5, 'Basic', '1 SEO article (1000 words)', 30.00, 2),
(14, 5, 'Standard', '5 SEO articles (1000 words each)', 125.00, 5),
(15, 5, 'Premium', '10 SEO articles + keyword research', 220.00, 7),

-- Copywriting (Service 6)
(16, 6, 'Basic', 'Website copy (3 pages)', 100.00, 3),
(17, 6, 'Standard', 'Complete website copy + email sequence', 300.00, 5),
(18, 6, 'Premium', 'Full marketing copy package', 600.00, 7),

-- Video Editing (Service 7)
(19, 7, 'Basic', 'Edit 1 video (up to 5 minutes)', 80.00, 2),
(20, 7, 'Standard', 'Edit 3 videos with color grading', 200.00, 4),
(21, 7, 'Premium', 'Edit 5 videos + motion graphics', 400.00, 7),

-- Animation (Service 8)
(22, 8, 'Basic', '30-second animation', 150.00, 5),
(23, 8, 'Standard', '60-second explainer video', 350.00, 7),
(24, 8, 'Premium', '2-minute animated video', 700.00, 10),

-- Social Media Marketing (Service 9)
(25, 9, 'Basic', 'Social media strategy document', 200.00, 3),
(26, 9, 'Standard', '1 month social media management', 500.00, 30),
(27, 9, 'Premium', '3 months full management + ads', 1400.00, 90),

-- Facebook Ads (Service 10)
(28, 10, 'Basic', 'Ad campaign setup + 1 week management', 250.00, 7),
(29, 10, 'Standard', '1 month ad management', 600.00, 30),
(30, 10, 'Premium', '3 months + advanced optimization', 1600.00, 90),

-- Python Scripts (Service 11)
(31, 11, 'Basic', 'Simple automation script', 100.00, 3),
(32, 11, 'Standard', 'Complex automation with error handling', 300.00, 5),
(33, 11, 'Premium', 'Full automation suite with GUI', 700.00, 10),

-- Data Analysis (Service 12)
(34, 12, 'Basic', 'Basic data analysis report', 150.00, 3),
(35, 12, 'Standard', 'Comprehensive analysis + visualizations', 400.00, 5),
(36, 12, 'Premium', 'Advanced analytics + dashboard', 900.00, 10),

-- Music Production (Service 13)
(37, 13, 'Basic', 'Mix 1 song', 120.00, 3),
(38, 13, 'Standard', 'Mix + master 1 song', 250.00, 5),
(39, 13, 'Premium', 'Full production (3 songs)', 800.00, 14),

-- Voice Over (Service 14)
(40, 14, 'Basic', 'Up to 100 words', 50.00, 1),
(41, 14, 'Standard', 'Up to 500 words', 150.00, 2),
(42, 14, 'Premium', 'Up to 1000 words + revisions', 300.00, 3),

-- Translation (Service 15)
(43, 15, 'Basic', 'Translate up to 500 words', 40.00, 2),
(44, 15, 'Standard', 'Translate up to 2000 words', 120.00, 4),
(45, 15, 'Premium', 'Translate up to 5000 words + proofreading', 280.00, 7),

-- SEO (Service 16)
(46, 16, 'Basic', 'SEO audit report', 150.00, 3),
(47, 16, 'Standard', 'On-page SEO optimization', 400.00, 7),
(48, 16, 'Premium', 'Complete SEO package (3 months)', 1200.00, 90);

-- ============================================================================
-- Services in Categories
-- ============================================================================

INSERT INTO services_in_category (service_id, category_id) VALUES
-- Graphics & Design (Services 1-2)
(1, 1), (2, 1),

-- Programming & Tech (Services 3-4, 11-12)
(3, 5), (4, 5), (11, 5), (12, 5),

-- Writing & Translation (Services 5-6, 15)
(5, 3), (6, 3), (15, 3),

-- Video & Animation (Services 7-8)
(7, 4), (8, 4),

-- Digital Marketing (Services 9-10, 16)
(9, 2), (10, 2), (16, 2),

-- Music & Audio (Services 13-14)
(13, 6), (14, 6);

-- ============================================================================
-- Orders
-- ============================================================================

INSERT INTO "order" (order_id, client_id, package_id, status, placed_time, due_time, total_price, progress) VALUES
(1, 1, 2, 'completed', NOW() - INTERVAL '30 days', NOW() - INTERVAL '23 days', 150.00, 'completed'),
(2, 2, 8, 'completed', NOW() - INTERVAL '25 days', NOW() - INTERVAL '18 days', 1200.00, 'completed'),
(3, 3, 14, 'in_progress', NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', 125.00, 'in_progress'),
(4, 1, 20, 'in_progress', NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', 200.00, 'in_progress'),
(5, 4, 26, 'submitted', NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days', 500.00, 'submitted'),
(6, 5, 32, 'delivered', NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days', 300.00, 'delivered'),
(7, 2, 38, 'completed', NOW() - INTERVAL '45 days', NOW() - INTERVAL '38 days', 250.00, 'completed'),
(8, 3, 44, 'completed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days', 120.00, 'completed'),
(9, 1, 47, 'in_progress', NOW() - INTERVAL '10 days', NOW() + INTERVAL '80 days', 400.00, 'in_progress'),
(10, 4, 11, 'submitted', NOW() - INTERVAL '2 days', NOW() + INTERVAL '12 days', 800.00, 'submitted');

-- ============================================================================
-- Reviews
-- ============================================================================

INSERT INTO review (review_id, order_id, rating, comment, submit_time) VALUES
(1, 1, 5, 'Amazing work! The logo exceeded my expectations. Very professional and responsive.', NOW() - INTERVAL '22 days'),
(2, 2, 5, 'Excellent developer. Delivered exactly what I needed on time. Highly recommend!', NOW() - INTERVAL '17 days'),
(7, 7, 4, 'Good quality mixing. Minor revisions needed but overall satisfied.', NOW() - INTERVAL '37 days'),
(8, 8, 5, 'Perfect translation! Native-level quality. Will hire again.', NOW() - INTERVAL '14 days');

-- ============================================================================
-- Money Transactions
-- ============================================================================

INSERT INTO money_transaction (transaction_id, amount, receiver_iban, sender_iban, created_at) VALUES
(1, 150.00, 'TR330006100519786457841326', 'TR330006100519786457841001', NOW() - INTERVAL '23 days'),
(2, 1200.00, 'TR330006100519786457841327', 'TR330006100519786457841002', NOW() - INTERVAL '18 days'),
(3, 250.00, 'TR330006100519786457841328', 'TR330006100519786457841002', NOW() - INTERVAL '38 days'),
(4, 120.00, 'TR330006100519786457841329', 'TR330006100519786457841003', NOW() - INTERVAL '15 days');

INSERT INTO client_transaction (transaction_id, client_id, freelancer_id) VALUES
(1, 1, 6),
(2, 2, 7),
(3, 2, 14),
(4, 3, 15);

INSERT INTO belongs_to_order (order_id, transaction_id) VALUES
(1, 1),
(2, 2),
(7, 3),
(8, 4);

-- ============================================================================
-- Conversations & Messages
-- ============================================================================

INSERT INTO conversation (conversation_id, order_id, opened_at) VALUES
(1, 1, NOW() - INTERVAL '30 days'),
(2, 2, NOW() - INTERVAL '25 days'),
(3, 3, NOW() - INTERVAL '5 days'),
(4, 4, NOW() - INTERVAL '3 days'),
(5, 5, NOW() - INTERVAL '1 day');

INSERT INTO message (conversation_id, message_no, sender_user_id, content, sent_time, seen_status) VALUES
-- Conversation 1
(1, 1, 1, 'Hi! I need a logo for my tech startup. Can you help?', NOW() - INTERVAL '30 days', true),
(1, 2, 6, 'Absolutely! I''d love to help. Can you tell me more about your brand?', NOW() - INTERVAL '30 days', true),
(1, 3, 1, 'We''re a SaaS company focused on project management tools.', NOW() - INTERVAL '29 days', true),
(1, 4, 6, 'Perfect! I''ll send you some initial concepts by tomorrow.', NOW() - INTERVAL '29 days', true),

-- Conversation 3
(3, 1, 3, 'Looking forward to the articles! When can I expect the first draft?', NOW() - INTERVAL '5 days', true),
(3, 2, 8, 'I''ll have the first 2 articles ready in 3 days!', NOW() - INTERVAL '5 days', true),
(3, 3, 3, 'Great! Thanks!', NOW() - INTERVAL '4 days', true),

-- Conversation 4
(4, 1, 1, 'Can you add some motion graphics to the intro?', NOW() - INTERVAL '3 days', true),
(4, 2, 9, 'Yes, I can add that. It will be an additional $50. Is that okay?', NOW() - INTERVAL '3 days', true),
(4, 3, 1, 'Perfect! Go ahead.', NOW() - INTERVAL '2 days', true);

-- ============================================================================
-- Skill Exams & Certifications
-- ============================================================================

INSERT INTO skill_exam (exam_id, skill_topic, result, content) VALUES
(1, 'JavaScript Fundamentals', 'pass', 'Multiple choice questions covering ES6+, async/await, promises, and DOM manipulation.'),
(2, 'React Development', 'pass', 'Questions on hooks, state management, component lifecycle, and best practices.'),
(3, 'SEO Basics', 'pass', 'Covering on-page SEO, keyword research, link building, and analytics.'),
(4, 'Graphic Design Principles', 'pass', 'Color theory, typography, composition, and design software proficiency.'),
(5, 'Content Writing', 'pass', 'Grammar, style, tone, SEO writing, and audience targeting.');

INSERT INTO certificate (certificate_id, issued_at) VALUES
(1, '2024-01-15'),
(2, '2024-02-20'),
(3, '2024-03-10'),
(4, '2023-12-05'),
(5, '2024-01-25');

INSERT INTO skill_certification (certificate_id, "userID", exam_id) VALUES
(1, 7, 1),
(2, 7, 2),
(3, 18, 3),
(4, 6, 4),
(5, 8, 5);

INSERT INTO test_attempt (attempt_id, freelancer_id, exam_id, started_at, submitted_at, score_percent, passed, answers_blob) VALUES
(1, 7, 1, NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', 92.50, true, '{"q1": "a", "q2": "c", "q3": "b"}'),
(2, 7, 2, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days', 88.00, true, '{"q1": "b", "q2": "a", "q3": "d"}'),
(3, 18, 3, NOW() - INTERVAL '75 days', NOW() - INTERVAL '75 days', 95.00, true, '{"q1": "c", "q2": "b", "q3": "a"}'),
(4, 6, 4, NOW() - INTERVAL '120 days', NOW() - INTERVAL '120 days', 91.00, true, '{"q1": "a", "q2": "d", "q3": "c"}'),
(5, 8, 5, NOW() - INTERVAL '85 days', NOW() - INTERVAL '85 days', 89.50, true, '{"q1": "b", "q2": "c", "q3": "a"}');

-- ============================================================================
-- Support Tickets
-- ============================================================================

INSERT INTO support_ticket (ticket_id, "userID", admin_id, subject, opened_at, status) VALUES
(1, 1, 21, 'Payment issue with order #1', NOW() - INTERVAL '15 days', 'closed'),
(2, 3, 21, 'How to request a refund?', NOW() - INTERVAL '10 days', 'closed'),
(3, 6, 22, 'Account verification needed', NOW() - INTERVAL '5 days', 'assigned'),
(4, 10, NULL, 'Question about service fees', NOW() - INTERVAL '2 days', 'open');

INSERT INTO ticket_message (ticket_id, message_no, sender_user_id, content, sent_at) VALUES
(1, 1, 1, 'I made a payment but it''s not showing in my account.', NOW() - INTERVAL '15 days'),
(1, 2, 21, 'Let me check that for you. Can you provide the transaction ID?', NOW() - INTERVAL '15 days'),
(1, 3, 1, 'Sure, it''s TXN123456789', NOW() - INTERVAL '14 days'),
(1, 4, 21, 'Found it! The payment was processed successfully. It should appear in your account within 24 hours.', NOW() - INTERVAL '14 days'),

(2, 1, 3, 'What''s your refund policy?', NOW() - INTERVAL '10 days'),
(2, 2, 21, 'You can request a refund within 14 days if the work doesn''t meet the agreed requirements.', NOW() - INTERVAL '10 days'),

(3, 1, 6, 'I need to verify my account to withdraw earnings.', NOW() - INTERVAL '5 days'),
(3, 2, 22, 'Please upload a government-issued ID and proof of address.', NOW() - INTERVAL '5 days');

-- ============================================================================
-- Revision Requests
-- ============================================================================

INSERT INTO revision_request (revision_id, order_id, requested_at, notes, request_status) VALUES
(1, 1, NOW() - INTERVAL '25 days', 'Can you make the logo slightly bolder?', 'fulfilled'),
(2, 2, NOW() - INTERVAL '20 days', 'Please adjust the header spacing on mobile view.', 'fulfilled'),
(3, 4, NOW() - INTERVAL '1 day', 'Add a fade transition between clips.', 'accepted');

-- ============================================================================
-- Disputes
-- ============================================================================

INSERT INTO dispute_resolution (dispute_id, order_id, category_id, creation_time, description, status) VALUES
(1, 6, 5, NOW() - INTERVAL '5 days', 'Code doesn''t work as described in the package.', 'under_review');

-- ============================================================================
-- Admin Reports
-- ============================================================================

INSERT INTO report (report_id, admin_id, generation_time, parameter, report_type) VALUES
(1, 21, NOW() - INTERVAL '7 days', 'monthly_revenue', 'Financial Report'),
(2, 22, NOW() - INTERVAL '14 days', 'user_growth', 'User Analytics'),
(3, 21, NOW() - INTERVAL '3 days', 'top_services', 'Service Performance');

-- ============================================================================
-- Service Add-ons
-- ============================================================================

-- Logo Design Service (service_id = 1)
INSERT INTO service_addon (service_id, name, description, price, delivery_days) VALUES
(1, 'Extra Fast Delivery', 'Get your logo in 1 day instead of 3', 20.00, -2),
(1, 'Source Files', 'Receive AI, PSD, and vector source files', 15.00, 0),
(1, 'Additional Revision', 'Get 1 extra revision beyond package limit', 10.00, 0),
(1, 'Social Media Kit', 'Logo optimized for all social media platforms', 30.00, 1),
(1, 'Commercial License', 'Full commercial usage rights', 50.00, 0),
(1, '3D Mockup', '3D visualization of your logo', 25.00, 2);

-- Minimalist Logo Service (service_id = 2)
INSERT INTO service_addon (service_id, name, description, price, delivery_days) VALUES
(2, 'Rush Delivery', 'Deliver in 24 hours', 30.00, -2),
(2, 'Brand Style Guide', 'Complete brand guidelines document', 40.00, 2),
(2, 'Business Card Design', 'Matching business card design', 35.00, 1),
(2, 'Letterhead Design', 'Professional letterhead template', 25.00, 1),
(2, 'Source Files Package', 'All editable source files', 20.00, 0);

-- Web Development Service (service_id = 3)
INSERT INTO service_addon (service_id, name, description, price, delivery_days) VALUES
(3, 'Extra Page', 'Add one additional page to your website', 50.00, 1),
(3, 'SEO Optimization', 'Complete on-page SEO setup', 100.00, 2),
(3, 'Contact Form Integration', 'Working contact form with email notifications', 40.00, 1),
(3, 'Google Analytics Setup', 'Analytics tracking and dashboard setup', 30.00, 0),
(3, 'Priority Support', '24-hour response time for 30 days', 50.00, 0),
(3, 'Performance Optimization', 'Speed optimization and caching setup', 75.00, 2),
(3, 'SSL Certificate Setup', 'HTTPS security configuration', 25.00, 0);

-- WordPress Service (service_id = 4)
INSERT INTO service_addon (service_id, name, description, price, delivery_days) VALUES
(4, 'E-commerce Integration', 'WooCommerce shop setup', 150.00, 3),
(4, 'Custom Plugin Development', 'One custom WordPress plugin', 200.00, 5),
(4, 'Backup & Security Setup', 'Automated backups and security hardening', 60.00, 1),
(4, 'Speed Optimization', 'Caching and performance tuning', 80.00, 2),
(4, 'Content Migration', 'Migrate content from old website', 100.00, 2);

-- SEO Writing Service (service_id = 5)
INSERT INTO service_addon (service_id, name, description, price, delivery_days) VALUES
(5, 'Extra 500 Words', 'Extend article by 500 words', 15.00, 0),
(5, 'Keyword Research', 'Professional keyword research and strategy', 20.00, 1),
(5, 'Meta Description', 'SEO-optimized meta description', 5.00, 0),
(5, 'Image Sourcing', 'Find and include 3 relevant images', 15.00, 0),
(5, 'Same Day Delivery', 'Deliver within 24 hours', 25.00, -1),
(5, 'Proofreading', 'Professional proofreading and editing', 10.00, 0);

-- Update existing packages to have revisions_allowed
UPDATE package SET revisions_allowed = 1 WHERE name = 'Basic';
UPDATE package SET revisions_allowed = 2 WHERE name = 'Standard';
UPDATE package SET revisions_allowed = 3 WHERE name = 'Premium';
UPDATE package SET revisions_allowed = 5 WHERE name = 'Ultimate';

-- ============================================================================
-- Verification
-- ============================================================================

SELECT 'Seed data inserted successfully!' as status;
SELECT COUNT(*) as total_users FROM "user";
SELECT COUNT(*) as total_services FROM service;
SELECT COUNT(*) as total_packages FROM package;
SELECT COUNT(*) as total_orders FROM "order";
SELECT COUNT(*) as total_reviews FROM review;
SELECT COUNT(*) as total_addons FROM service_addon;

