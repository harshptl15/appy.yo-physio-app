-- Apply this to existing physio databases.
USE `physio`;

ALTER TABLE `User`
  ADD COLUMN gender ENUM('male', 'female', 'non_binary', 'prefer_not_to_say', 'other') NULL AFTER password,
  ADD COLUMN age TINYINT UNSIGNED NULL AFTER gender,
  ADD COLUMN height_unit ENUM('cm', 'ft_in') NULL AFTER age,
  ADD COLUMN height_cm SMALLINT UNSIGNED NULL AFTER height_unit,
  ADD COLUMN height_ft TINYINT UNSIGNED NULL AFTER height_cm,
  ADD COLUMN height_in TINYINT UNSIGNED NULL AFTER height_ft,
  ADD COLUMN weight_unit ENUM('kg', 'lbs') NULL AFTER height_in,
  ADD COLUMN weight_value SMALLINT UNSIGNED NULL AFTER weight_unit,
  ADD COLUMN injury_focus ENUM('none', 'knee', 'shoulder', 'back', 'neck', 'ankle', 'hip', 'elbow', 'wrist', 'other') NULL AFTER weight_value,
  ADD COLUMN injury_focus_other VARCHAR(120) NULL AFTER injury_focus,
  ADD COLUMN condition_focus ENUM('general_fitness', 'strength_building', 'muscle_gain', 'fat_loss', 'rehab', 'mobility', 'endurance', 'post_surgery_recovery', 'athletic_performance') NULL AFTER injury_focus_other,
  ADD COLUMN rehab_level ENUM('beginner', 'intermediate', 'advanced') NULL DEFAULT 'beginner' AFTER condition_focus;

ALTER TABLE `User`
  ADD CONSTRAINT chk_user_age CHECK (age IS NULL OR (age BETWEEN 10 AND 120)),
  ADD CONSTRAINT chk_height_cm_range CHECK (height_cm IS NULL OR (height_cm BETWEEN 140 AND 220)),
  ADD CONSTRAINT chk_height_ft_range CHECK (height_ft IS NULL OR (height_ft BETWEEN 4 AND 7)),
  ADD CONSTRAINT chk_height_in_range CHECK (height_in IS NULL OR (height_in BETWEEN 0 AND 11)),
  ADD CONSTRAINT chk_height_unit_consistency CHECK (
    (height_unit IS NULL AND height_cm IS NULL AND height_ft IS NULL AND height_in IS NULL)
    OR (height_unit = 'cm' AND height_cm IS NOT NULL AND height_ft IS NULL AND height_in IS NULL)
    OR (height_unit = 'ft_in' AND height_cm IS NULL AND height_ft IS NOT NULL AND height_in IS NOT NULL)
  ),
  ADD CONSTRAINT chk_weight_value_range CHECK (
    (weight_unit IS NULL AND weight_value IS NULL)
    OR (weight_unit = 'kg' AND weight_value BETWEEN 40 AND 180)
    OR (weight_unit = 'lbs' AND weight_value BETWEEN 90 AND 400)
  ),
  ADD CONSTRAINT chk_injury_other_consistency CHECK (
    injury_focus = 'other' OR injury_focus_other IS NULL
  );
