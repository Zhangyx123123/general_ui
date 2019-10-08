-- phpMyAdmin SQL Dump
-- version 4.7.2
-- https://www.phpmyadmin.net/
--
-- 主機: db
-- 產生時間： 2017 年 07 月 24 日 09:58
-- 伺服器版本: 5.7.18
-- PHP 版本： 7.0.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `authentication`
--
CREATE DATABASE IF NOT EXISTS `authentication` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `authentication`;

-- --------------------------------------------------------

--
-- 資料表結構 `appid_list`
--

CREATE TABLE IF NOT EXISTS `appid_list` (
  `app_id` char(32) NOT NULL,
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `api_cnt` int(11) NOT NULL COMMENT 'daily count limitation',
  `expiration_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'client decide the usage',
  `analysis_time` int(11) NOT NULL COMMENT 'total voice limitation, in second',
  `activation` tinyint(1) NOT NULL,
  PRIMARY KEY (`app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 資料表結構 `enterprise_list`
--

CREATE TABLE IF NOT EXISTS `enterprise_list` (
  `enterprise_id` char(32) NOT NULL,
  `enterprise_name` varchar(64) NOT NULL,
  `created_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `industry` varchar(32) DEFAULT NULL,
  `phone_number` varchar(16) DEFAULT NULL COMMENT '+86 23471234',
  `address` varchar(256) DEFAULT NULL,
  `people_numbers` int(5) NOT NULL,
  `app_id` char(32) NOT NULL,
  PRIMARY KEY (`enterprise_id`),
  UNIQUE KEY `app_id_idx` (`app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 資料表結構 `privilege_list`
--

CREATE TABLE IF NOT EXISTS `privilege_list` (
  `privilege_id` int(11) NOT NULL AUTO_INCREMENT,
  `privilege_name` varchar(32) NOT NULL,
  `cmd_list` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`privilege_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 資料表結構 `role_list`
--

CREATE TABLE IF NOT EXISTS `role_list` (
  `role_id` char(32) NOT NULL,
  `role_name` varchar(32) NOT NULL,
  `privilege` json NOT NULL,
  `enterprise_id` char(32) NOT NULL,
  PRIMARY KEY (`role_id`),
  KEY `enterprise_id_idx` (`enterprise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 資料表結構 `user_list`
--

CREATE TABLE IF NOT EXISTS `user_list` (
  `user_id` char(32) NOT NULL,
  `user_name` varchar(32) NOT NULL,
  `user_type` tinyint(4) NOT NULL,
  `password` varchar(32) NOT NULL,
  `role_id` char(32) DEFAULT NULL,
  `email` varchar(256) DEFAULT NULL,
  `enterprise_id` char(32) NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `enterprise_id_idx` (`enterprise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
