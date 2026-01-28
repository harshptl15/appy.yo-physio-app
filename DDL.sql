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
    sets INT NULL,
    reps VARCHAR(45) NULL,
    hold_time_sec INT NULL,
    rest_time_sec INT NULL,
    CONSTRAINT chk_is_gym_only_bool CHECK (is_gym_only IN (0, 1))
);

CREATE TABLE `User` (
	id INT PRIMARY KEY auto_increment,
    username VARCHAR(45) UNIQUE NOT NULL,
    email VARCHAR(45) UNIQUE NOT NULL,
    password VARCHAR(150) NOT NULL,
    twofa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    twofa_secret VARCHAR(32) NULL
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

CREATE TABLE `Routine_Entry` (
	id INT PRIMARY KEY AUTO_INCREMENT,
	User_id INT NOT NULL,
    Exercise_id INT NOT NULL,
    Goal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_User_id_Routine_Entry FOREIGN KEY (User_id) REFERENCES User(id),
    CONSTRAINT fk_Exercise_id_Routine_Entry FOREIGN KEY (Exercise_id) REFERENCES Exercise(id)
);

-- User creation
DROP USER IF EXISTS 'group7'@'localhost';
CREATE USER 'group7'@'localhost' IDENTIFIED BY 'group7pwd';

-- Grants
GRANT SELECT ON `physio`.* TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`User` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Favourites` TO 'group7'@'localhost';
GRANT INSERT, DELETE, UPDATE ON `physio`.`Routine_Entry` TO 'group7'@'localhost';