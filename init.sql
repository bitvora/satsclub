-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS satsclub;

-- Use the database
\c satsclub;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 