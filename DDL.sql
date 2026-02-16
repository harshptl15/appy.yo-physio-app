-- Database creation
DROP SCHEMA IF EXISTS `physio`;
CREATE SCHEMA `physio`;

USE `physio`;

-- Table Creation
CREATE TABLE `Exercise` (
	id INT PRIMARY KEY auto_increment,
    name VARCHAR(45) NOT NULL,
    category ENUM('stretch', 'strengthen') NOT NULL,
    is_gym_only BOOLEAN NOT NULL,
    tips TEXT NULL,
    common_mistakes TEXT NULL,
    image_link VARCHAR(255) NULL,
    video_link VARCHAR(255) NULL,
    position VARCHAR(45) NULL,
    equipment_needed TEXT NULL,
    skill_level VARCHAR(45) NULL,
    tempo VARCHAR(45) NULL,
    `sets` INT NULL,
    `reps` VARCHAR(45) NULL,
    hold_time_sec INT NULL,
    rest_time_sec INT NULL,
    CONSTRAINT chk_is_gym_only_bool CHECK (is_gym_only IN (0, 1))
);

CREATE TABLE `User` (
	id INT PRIMARY KEY auto_increment,
    username VARCHAR(45) UNIQUE NOT NULL,
    email VARCHAR(45) UNIQUE NOT NULL,
    password VARCHAR(150) NOT NULL,
    gender ENUM('male', 'female', 'non_binary', 'prefer_not_to_say', 'other') NULL,
    age TINYINT UNSIGNED NULL,
    height_unit ENUM('cm', 'ft_in') NULL,
    height_cm SMALLINT UNSIGNED NULL,
    height_ft TINYINT UNSIGNED NULL,
    height_in TINYINT UNSIGNED NULL,
    weight_unit ENUM('kg', 'lbs') NULL,
    weight_value SMALLINT UNSIGNED NULL,
    injury_focus ENUM('none', 'knee', 'shoulder', 'back', 'neck', 'ankle', 'hip', 'elbow', 'wrist', 'other') NULL,
    injury_focus_other VARCHAR(120) NULL,
    condition_focus ENUM('general_fitness', 'strength_building', 'muscle_gain', 'fat_loss', 'rehab', 'mobility', 'endurance', 'post_surgery_recovery', 'athletic_performance') NULL,
    rehab_level ENUM('beginner', 'intermediate', 'advanced') NULL DEFAULT 'beginner',
    twofa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    twofa_secret VARCHAR(32) NULL,
    CONSTRAINT chk_user_age CHECK (age IS NULL OR (age BETWEEN 10 AND 120)),
    CONSTRAINT chk_height_cm_range CHECK (height_cm IS NULL OR (height_cm BETWEEN 140 AND 220)),
    CONSTRAINT chk_height_ft_range CHECK (height_ft IS NULL OR (height_ft BETWEEN 4 AND 7)),
    CONSTRAINT chk_height_in_range CHECK (height_in IS NULL OR (height_in BETWEEN 0 AND 11)),
    CONSTRAINT chk_height_unit_consistency CHECK (
      (height_unit IS NULL AND height_cm IS NULL AND height_ft IS NULL AND height_in IS NULL)
      OR (height_unit = 'cm' AND height_cm IS NOT NULL AND height_ft IS NULL AND height_in IS NULL)
      OR (height_unit = 'ft_in' AND height_cm IS NULL AND height_ft IS NOT NULL AND height_in IS NOT NULL)
    ),
    CONSTRAINT chk_weight_value_range CHECK (
      (weight_unit IS NULL AND weight_value IS NULL)
      OR (weight_unit = 'kg' AND weight_value BETWEEN 40 AND 180)
      OR (weight_unit = 'lbs' AND weight_value BETWEEN 90 AND 400)
    ),
    CONSTRAINT chk_injury_other_consistency CHECK (
      injury_focus = 'other' OR injury_focus_other IS NULL
    )
);

CREATE TABLE `Muscle_Group` (
	id INT PRIMARY KEY auto_increment,
    name VARCHAR(45) NOT NULL
);

CREATE TABLE `Exercise_Muscle_Group` (
	Exercise_id INT NOT NULL,
    Muscle_Group_id INT NOT NULL,
    PRIMARY KEY (Exercise_id, Muscle_Group_id),
    CONSTRAINT fk_Exercise_id_Exercise_Muscle_Group FOREIGN KEY (Exercise_id) REFERENCES Exercise(id),
    CONSTRAINT fk_Muscle_Group_id_Exercise_Muscle_Group FOREIGN KEY (Muscle_Group_id) REFERENCES Muscle_Group(id)
);

CREATE TABLE `Favourites` (
	User_id INT NOT NULL,
    Exercise_id INT NOT NULL,
    PRIMARY KEY (User_id, Exercise_id),
    CONSTRAINT fk_User_id_Favourites FOREIGN KEY (User_id) REFERENCES User(id),
    CONSTRAINT fk_Exercise_id_Favourites FOREIGN KEY (Exercise_id) REFERENCES Exercise(id)
);

CREATE TABLE `Workout_Recovery_Preferences` (
    user_id INT PRIMARY KEY,
    preferred_workout_duration_minutes INT NOT NULL DEFAULT 30,
    recovery_day_reminders_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    pain_feedback_after_workouts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    auto_adjust_difficulty_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    conservative_progression_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_Workout_Recovery_Preferences FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    CONSTRAINT chk_preferred_workout_duration_minutes CHECK (preferred_workout_duration_minutes IN (15, 20, 30, 45, 60))
);

CREATE TABLE `Notification_Preferences` (
    user_id INT PRIMARY KEY,
    workout_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    rest_day_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    progress_checkins_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    routine_recommendations_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_reminder_time CHAR(5) NOT NULL DEFAULT '18:00',
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_Notification_Preferences FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE `Workout_Session` (
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
    CONSTRAINT fk_user_id_Workout_Session FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

CREATE TABLE `Routine_Entry` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	User_id INT NOT NULL,
    Exercise_id INT NOT NULL,
    workout_session_id INT NULL,
    Goal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_User_id_Routine_Entry FOREIGN KEY (User_id) REFERENCES User(id),
    CONSTRAINT fk_Exercise_id_Routine_Entry FOREIGN KEY (Exercise_id) REFERENCES Exercise(id),
    CONSTRAINT fk_workout_session_id_Routine_Entry FOREIGN KEY (workout_session_id) REFERENCES Workout_Session(id) ON DELETE SET NULL
);

CREATE TABLE `Workout_Pain_Feedback` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workout_session_id INT NOT NULL,
    user_id INT NOT NULL,
    pain_score INT NOT NULL,
    trend ENUM('worse', 'same', 'better') NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_feedback_per_session (workout_session_id),
    CONSTRAINT fk_workout_session_id_Workout_Pain_Feedback FOREIGN KEY (workout_session_id) REFERENCES Workout_Session(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_id_Workout_Pain_Feedback FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    CONSTRAINT chk_pain_score_range CHECK (pain_score BETWEEN 0 AND 10)
);

CREATE TABLE `Progress_CheckIn` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    mood VARCHAR(80) NULL,
    pain_avg INT NULL,
    mobility_rating INT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id_Progress_CheckIn FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    CONSTRAINT chk_progress_checkin_pain_avg CHECK (pain_avg IS NULL OR (pain_avg BETWEEN 0 AND 10)),
    CONSTRAINT chk_progress_checkin_mobility CHECK (mobility_rating IS NULL OR (mobility_rating BETWEEN 1 AND 5))
);

CREATE TABLE `Notification_Log` (
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
    CONSTRAINT fk_user_id_Notification_Log FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

-- User creation
DROP USER IF EXISTS 'group7'@'localhost';
CREATE USER 'group7'@'localhost' IDENTIFIED BY 'group7pwd';

-- Grants
GRANT SELECT ON `physio`.* TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`User` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Favourites` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Routine_Entry` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Workout_Recovery_Preferences` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Notification_Preferences` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Workout_Session` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Workout_Pain_Feedback` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Progress_CheckIn` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Notification_Log` TO 'group7'@'localhost';
