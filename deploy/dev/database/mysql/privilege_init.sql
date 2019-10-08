-- phpMyAdmin SQL Dump
-- version 4.7.2
-- https://www.phpmyadmin.net/
--
-- 主機: db
-- 產生時間： 2017 年 09 月 12 日 08:34
-- 伺服器版本: 8.0.2-dmr
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
-- 資料表結構 `privilege_list`
--

CREATE TABLE IF NOT EXISTS `privilege_list` (
  `privilege_id` int(11) NOT NULL AUTO_INCREMENT,
  `privilege_name` varchar(32) NOT NULL,
  `cmd_list` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`privilege_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 資料表的匯出資料 `privilege_list`
--

INSERT INTO `privilege_list` (`privilege_name`, `cmd_list`) VALUES
('statistic_dash', 'view'),
('statistic_daily', 'view'),
('statistic_audit', 'view'),
('qalist', 'view,edit,create,delete,export,import'),
('qatest', 'view'),
('qa_chat_skill', 'view,edit'),
('robot_profile', 'view,edit'),
('wordbank', 'view,edit,create,delete,export,import'),
('management', 'edit');

INSERT INTO `enterprise_list` (`enterprise_id`, `enterprise_name`, `created_time`, `industry`, `phone_number`, `address`, `people_numbers`, `app_id`) VALUES
('a3121bb5cdac2990dbd59a3fa7dc0bc4', 'CSBOT', '2017-10-17 08:55:38', '电商', '0000000000', 'CSBOT', 50, 'CSBOT');
INSERT INTO `appid_list` (`app_id`, `created_time`, `api_cnt`, `expiration_time`, `analysis_time`, `activation`) VALUES
('csbot', '2017-10-17 08:55:38', 1000, '2017-07-25 20:10:00', 100000, 1);
INSERT INTO `user_list` (`user_id`, `user_name`, `user_type`, `password`, `role_id`, `email`, `enterprise_id`) VALUES
('787a1b57da75fa43bacb49339bcd3b25', 'csbotadmin', 0, 'ac04367d3155bb651df2e4220bdb8303', NULL, 'csbot@emotibot.com', 'a3121bb5cdac2990dbd59a3fa7dc0bc4');

COMMIT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
