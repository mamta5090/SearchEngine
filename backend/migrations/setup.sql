-- ============================================================
-- Multi-Tenant Search-as-a-Service Platform — MySQL Schema
-- Database: lumina_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS lumina_db;
USE lumina_db;

-- ----------------------------------------
-- USERS TABLE (already exists, ensure structure)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS user1 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- DATABASE CONNECTIONS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS database_connections (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  db_type VARCHAR(20) NOT NULL DEFAULT 'mysql',
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL DEFAULT 3306,
  database_name VARCHAR(100) NOT NULL,
  db_username VARCHAR(100) NOT NULL,
  encrypted_password TEXT NOT NULL,
  `ssl` TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_conn_user FOREIGN KEY (user_id) REFERENCES user1(id) ON DELETE CASCADE,
  INDEX idx_conn_user (user_id)
);

-- ----------------------------------------
-- SEARCH INDEXES TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS search_indexes (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  searchable_fields JSON,
  status ENUM('empty','processing','ready','error') NOT NULL DEFAULT 'empty',
  document_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_idx_user FOREIGN KEY (user_id) REFERENCES user1(id) ON DELETE CASCADE,
  INDEX idx_srch_user (user_id),
  UNIQUE KEY uniq_idx_name_user (user_id, name)
);

-- ----------------------------------------
-- DOCUMENTS TABLE (stores raw JSON per document)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id CHAR(36) NOT NULL PRIMARY KEY,
  index_id CHAR(36) NOT NULL,
  user_id INT NOT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_index FOREIGN KEY (index_id) REFERENCES search_indexes(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_user FOREIGN KEY (user_id) REFERENCES user1(id) ON DELETE CASCADE,
  INDEX idx_doc_index (index_id),
  INDEX idx_doc_user (user_id)
);

-- ----------------------------------------
-- INGESTION JOBS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  index_id CHAR(36) NOT NULL,
  source_type ENUM('json','csv') NOT NULL,
  status ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
  document_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_job_user FOREIGN KEY (user_id) REFERENCES user1(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_index FOREIGN KEY (index_id) REFERENCES search_indexes(id) ON DELETE CASCADE,
  INDEX idx_job_user (user_id),
  INDEX idx_job_index (index_id)
);
