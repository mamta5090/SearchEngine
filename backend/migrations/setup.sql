-- ============================================================
-- Multi-Tenant Search-as-a-Service Platform — MySQL Schema
-- Database: lumina_db
-- ============================================================

CREATE DATABASE lumina_db;
USE lumina_db;

-- ----------------------------------------
-- USERS TABLE (already exists, ensure structure)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS user1 (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- DATABASE CONNECTIONS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS database_connections (
  id CHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  db_type VARCHAR(20) NOT NULL DEFAULT 'mysql',
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL DEFAULT 3306,
  database_name VARCHAR(100) NOT NULL,
  db_username VARCHAR(100) NOT NULL,
  encrypted_password TEXT NOT NULL,
  ssl BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_conn_user 
    FOREIGN KEY (user_id) REFERENCES user1(id) 
    ON DELETE CASCADE
);

-- ----------------------------------------
-- SEARCH INDEXES TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS search_indexes (
  id CHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  searchable_fields JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'empty',
  document_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_idx_user 
    FOREIGN KEY (user_id) REFERENCES user1(id) 
    ON DELETE CASCADE,

  CONSTRAINT uniq_idx_name_user 
    UNIQUE (user_id, name)
);

-- ----------------------------------------
-- DOCUMENTS TABLE (stores raw JSON per document)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id CHAR(36) PRIMARY KEY,
  index_id CHAR(36) NOT NULL,
  user_id INT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_doc_index 
    FOREIGN KEY (index_id) REFERENCES search_indexes(id) 
    ON DELETE CASCADE,

  CONSTRAINT fk_doc_user 
    FOREIGN KEY (user_id) REFERENCES user1(id) 
    ON DELETE CASCADE
);


CREATE TYPE source_type_enum AS ENUM ('json','csv');
CREATE TYPE job_status_enum AS ENUM ('pending','processing','done','failed');
-- ----------------------------------------
-- INGESTION JOBS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id CHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  index_id CHAR(36) NOT NULL,
  source_type source_type_enum NOT NULL,
  status job_status_enum NOT NULL DEFAULT 'pending',
  document_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,

  CONSTRAINT fk_job_user 
    FOREIGN KEY (user_id) REFERENCES user1(id) 
    ON DELETE CASCADE,

  CONSTRAINT fk_job_index 
    FOREIGN KEY (index_id) REFERENCES search_indexes(id) 
    ON DELETE CASCADE
);
