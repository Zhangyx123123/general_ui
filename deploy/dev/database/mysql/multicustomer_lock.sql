-- MySQL Script generated by MySQL Workbench
-- Fri Dec 15 11:27:06 2017
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE DATABASE IF NOT EXISTS `emotibot` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `emotibot`;

-- -----------------------------------------------------
-- Table `emotibot`.`state_machine`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `state_machine` (
  `state_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `content` LONGBLOB NULL,
  `action` VARCHAR(32) NOT NULL,
  `status` VARCHAR(16) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `created_time` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_time` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `extra_info` TEXT NULL,
  PRIMARY KEY (`state_id`),
  INDEX `action` (`action` ASC),
  INDEX `state` (`status` ASC),
  INDEX `user` (`user_id` ASC))
ENGINE = InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ;


-- -----------------------------------------------------
-- Table `emotibot`.`locker`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `locker` (
  `lock_id` BIGINT UNSIGNED NOT NULL,
  `get_by` VARCHAR(32) NULL,
  `updated_time` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`lock_id`),
  UNIQUE INDEX `lock_id_UNIQUE` (`lock_id` ASC))
ENGINE = InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

insert into locker (lock_id, get_by) values (1,'none');
