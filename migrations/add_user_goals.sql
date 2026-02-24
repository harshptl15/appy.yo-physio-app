-- Migration: Add User_Goals table for storing user fitness goals
-- Run this in your MySQL database: mysql -u root -p physio < migrations/add_user_goals.sql

USE `physio`;

CREATE TABLE IF NOT EXISTS `User_Goals` (
    user_id INT PRIMARY KEY,
    muscle_ids VARCHAR(255) NULL COMMENT 'Comma-separated Muscle_Group ids',
    intensity ENUM('slight', 'moderate', 'significant', 'maximum') DEFAULT 'moderate',
    notes TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_User_Goals_user FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);
