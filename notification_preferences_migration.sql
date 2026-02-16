-- Apply this migration to an existing physio database.
USE `physio`;

CREATE TABLE IF NOT EXISTS `Notification_Preferences` (
  user_id INT PRIMARY KEY,
  workout_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  rest_day_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  progress_checkins_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  routine_recommendations_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  preferred_reminder_time CHAR(5) NOT NULL DEFAULT '18:00',
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_id_Notification_Preferences FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
);

INSERT INTO Notification_Preferences (
  user_id,
  workout_reminders_enabled,
  rest_day_reminders_enabled,
  progress_checkins_enabled,
  routine_recommendations_enabled,
  preferred_reminder_time,
  timezone
)
SELECT id, TRUE, TRUE, FALSE, TRUE, '18:00', 'UTC'
FROM `User`
WHERE id NOT IN (SELECT user_id FROM Notification_Preferences);

CREATE TABLE IF NOT EXISTS `Progress_CheckIn` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  mood VARCHAR(80) NULL,
  pain_avg INT NULL,
  mobility_rating INT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_id_Progress_CheckIn FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE,
  CONSTRAINT chk_progress_checkin_pain_avg CHECK (pain_avg IS NULL OR (pain_avg BETWEEN 0 AND 10)),
  CONSTRAINT chk_progress_checkin_mobility CHECK (mobility_rating IS NULL OR (mobility_rating BETWEEN 1 AND 5))
);

CREATE TABLE IF NOT EXISTS `Notification_Log` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('WORKOUT_REMINDER', 'REST_DAY_REMINDER', 'PROGRESS_CHECKIN', 'ROUTINE_RECOMMENDATION') NOT NULL,
  status ENUM('CREATED', 'SHOWN', 'DISMISSED', 'SENT') NOT NULL DEFAULT 'CREATED',
  scheduled_for DATETIME NULL,
  shown_at DATETIME NULL,
  metadata JSON NULL,
  message VARCHAR(255) NULL,
  shown_on_dashboard BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_id_Notification_Log FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
);

-- Add new Notification_Log columns for older schemas where Notification_Log already existed.
SET @sql := IF(
  EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notification_Log' AND COLUMN_NAME = 'type'
  ),
  'SELECT 1',
  "ALTER TABLE `Notification_Log` ADD COLUMN `type` ENUM('WORKOUT_REMINDER', 'REST_DAY_REMINDER', 'PROGRESS_CHECKIN', 'ROUTINE_RECOMMENDATION') NOT NULL DEFAULT 'WORKOUT_REMINDER'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notification_Log' AND COLUMN_NAME = 'status'
  ),
  'SELECT 1',
  "ALTER TABLE `Notification_Log` ADD COLUMN `status` ENUM('CREATED', 'SHOWN', 'DISMISSED', 'SENT') NOT NULL DEFAULT 'CREATED'"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notification_Log' AND COLUMN_NAME = 'scheduled_for'
  ),
  'SELECT 1',
  'ALTER TABLE `Notification_Log` ADD COLUMN `scheduled_for` DATETIME NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notification_Log' AND COLUMN_NAME = 'shown_at'
  ),
  'SELECT 1',
  'ALTER TABLE `Notification_Log` ADD COLUMN `shown_at` DATETIME NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notification_Log' AND COLUMN_NAME = 'metadata'
  ),
  'SELECT 1',
  'ALTER TABLE `Notification_Log` ADD COLUMN `metadata` JSON NULL'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Notification_Log' AND COLUMN_NAME = 'updated_at'
  ),
  'SELECT 1',
  'ALTER TABLE `Notification_Log` ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure legacy NOT NULL message column does not block new structured inserts.
SET @sql := IF(
  EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Notification_Log'
      AND COLUMN_NAME = 'message'
      AND IS_NULLABLE = 'NO'
  ),
  'ALTER TABLE `Notification_Log` MODIFY COLUMN `message` VARCHAR(255) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure app DB user can read/write new notification tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON `physio`.`Notification_Preferences` TO 'group7'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `physio`.`Progress_CheckIn` TO 'group7'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `physio`.`Notification_Log` TO 'group7'@'localhost';
