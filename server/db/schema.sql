-- vSecure IAM Maturity Assessment Platform — database schema
-- MySQL 8+ / MariaDB 10.6+
--
-- Model (per vSecure assessment methodology):
--   assessment area (IGA / PAM / WAM / CIAM, or "overall" = all areas)
--     └─ control area  (rows in `domains`, e.g. "PAM Strategy & Landscape")
--         └─ sub-category (label on each question, e.g. "Architecture")
--             └─ question — type "maturity" (scored 1–5) or
--                           "information" (free text, unscored, reported as
--                           current-environment understanding)

CREATE TABLE IF NOT EXISTS domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  domain_weight INT DEFAULT 1,
  domain_type ENUM('overall', 'IGA', 'PAM', 'WAM', 'CIAM') DEFAULT 'overall',
  vsecure_capability VARCHAR(255),
  icon VARCHAR(50),
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain_id INT NOT NULL,
  sub_category VARCHAR(150),
  question_type ENUM('maturity', 'information') DEFAULT 'maturity',
  question_text TEXT NOT NULL,
  guidance TEXT,
  question_weight INT DEFAULT 1,
  nist_reference VARCHAR(100),
  cis_reference VARCHAR(100),
  csf_function ENUM('Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'),
  level_0_label VARCHAR(255) DEFAULT 'N/A - Not applicable to our organisation',
  level_1_label VARCHAR(500),
  level_2_label VARCHAR(500),
  level_3_label VARCHAR(500),
  level_4_label VARCHAR(500),
  level_5_label VARCHAR(500),
  sort_order INT DEFAULT 0,
  FOREIGN KEY (domain_id) REFERENCES domains(id)
);

CREATE TABLE IF NOT EXISTS assessment_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_role VARCHAR(100),
  company_size ENUM('1-50', '51-200', '201-1000', '1000+'),
  industry VARCHAR(100),
  region VARCHAR(100),
  assessment_type ENUM('overall', 'IGA', 'PAM', 'WAM', 'CIAM') DEFAULT 'overall',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  overall_score DECIMAL(3,2),
  domain_scores JSON,
  critical_gaps JSON,
  session_token VARCHAR(255) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  question_id INT NOT NULL,
  -- Maturity answers: 0 (N/A) to 5. NULL for information answers.
  level_selected TINYINT NULL,
  -- Information answers: free-text current-environment detail.
  answer_text TEXT NULL,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES assessment_sessions(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE KEY uniq_session_question (session_id, question_id)
);
