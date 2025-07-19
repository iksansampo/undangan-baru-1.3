-- SQL setup untuk platform undangan digital
CREATE DATABASE IF NOT EXISTS undangan_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE undangan_digital;

-- Tabel users (admin)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel invitations
CREATE TABLE IF NOT EXISTS invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  event_date DATETIME NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  cover_image VARCHAR(255) DEFAULT NULL,
  theme VARCHAR(100) DEFAULT 'classic_elegant',
  couple_name VARCHAR(255) DEFAULT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabel guests
CREATE TABLE IF NOT EXISTS guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invitation_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(191) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_guests_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabel rsvp
CREATE TABLE IF NOT EXISTS rsvp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invitation_id INT NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  status ENUM('yes','no','maybe') DEFAULT 'maybe',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rsvp_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Contoh user admin default (password: admin123, akan di-hash di PHP)
INSERT INTO users (email, password_hash)
VALUES ('admin@example.com', '$2y$10$abcdefghijklmnopqrstuv1234567890abcdefghiJKLmnopqrstu'); -- ganti hash nyata
