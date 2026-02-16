-- Apply this migration to an existing physio database.
USE `physio`;

CREATE TABLE IF NOT EXISTS `Workout_Recovery_Preferences` (
    user_id INT PRIMARY KEY,
    preferred_workout_duration_minutes INT NOT NULL DEFAULT 30,
    recovery_day_reminders_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    pain_feedback_after_workouts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    auto_adjust_difficulty_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    conservative_progression_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_Workout_Recovery_Preferences FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE,
    CONSTRAINT chk_preferred_workout_duration_minutes CHECK (preferred_workout_duration_minutes IN (15, 20, 30, 45, 60))
);

CREATE TABLE IF NOT EXISTS `Workout_Session` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    preferred_workout_duration_minutes INT NOT NULL,
    target_exercise_count INT NOT NULL,
    estimated_duration_minutes INT NOT NULL,
    difficulty_before DECIMAL(6, 2) NOT NULL DEFAULT 1.00,
    difficulty_after DECIMAL(6, 2) NOT NULL DEFAULT 1.00,
    completion_ratio DECIMAL(6, 2) NULL,
    adjustment_reason VARCHAR(255) NULL,
    conservative_progression_applied BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_user_id_Workout_Session FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
);

-- MySQL compatibility: add column/constraint only if missing.
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Routine_Entry'
    AND COLUMN_NAME = 'workout_session_id'
);
SET @sql_add_col := IF(
  @col_exists = 0,
  'ALTER TABLE `Routine_Entry` ADD COLUMN `workout_session_id` INT NULL',
  'SELECT 1'
);
PREPARE stmt_add_col FROM @sql_add_col;
EXECUTE stmt_add_col;
DEALLOCATE PREPARE stmt_add_col;

SET @fk_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Routine_Entry'
    AND CONSTRAINT_NAME = 'fk_workout_session_id_Routine_Entry'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql_add_fk := IF(
  @fk_exists = 0,
  'ALTER TABLE `Routine_Entry` ADD CONSTRAINT `fk_workout_session_id_Routine_Entry` FOREIGN KEY (`workout_session_id`) REFERENCES `Workout_Session`(`id`) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt_add_fk FROM @sql_add_fk;
EXECUTE stmt_add_fk;
DEALLOCATE PREPARE stmt_add_fk;

CREATE TABLE IF NOT EXISTS `Workout_Pain_Feedback` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workout_session_id INT NOT NULL,
    user_id INT NOT NULL,
    pain_score INT NOT NULL,
    trend ENUM('worse', 'same', 'better') NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_feedback_per_session (workout_session_id),
    CONSTRAINT fk_workout_session_id_Workout_Pain_Feedback FOREIGN KEY (workout_session_id) REFERENCES Workout_Session(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_id_Workout_Pain_Feedback FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE,
    CONSTRAINT chk_pain_score_range CHECK (pain_score BETWEEN 0 AND 10)
);

CREATE TABLE IF NOT EXISTS `Notification_Log` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    message VARCHAR(255) NOT NULL,
    shown_on_dashboard BOOLEAN NOT NULL DEFAULT FALSE,
    shown_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_Notification_Log FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
);

INSERT INTO Workout_Recovery_Preferences (
  user_id,
  preferred_workout_duration_minutes,
  recovery_day_reminders_enabled,
  pain_feedback_after_workouts_enabled,
  auto_adjust_difficulty_enabled,
  conservative_progression_enabled
)
SELECT id, 30, FALSE, TRUE, TRUE, FALSE
FROM `User`
WHERE id NOT IN (SELECT user_id FROM Workout_Recovery_Preferences);

-- Ensure app DB user can read/write workout recovery tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON `physio`.`Workout_Recovery_Preferences` TO 'group7'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `physio`.`Workout_Session` TO 'group7'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `physio`.`Workout_Pain_Feedback` TO 'group7'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `physio`.`Notification_Log` TO 'group7'@'localhost';
