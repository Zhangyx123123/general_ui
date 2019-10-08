# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 172.16.101.47 (MySQL 5.5.5-10.2.8-MariaDB-10.2.8+maria~jessie)
# Database: self_learning
# Generation Time: 2018-05-09 04:14:03 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table clustering_result
# ------------------------------------------------------------

CREATE TABLE `clustering_result` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unresolved_report_id` bigint(20) unsigned NOT NULL,
  `feedback_id` bigint(20) unsigned NOT NULL,
  `cluster_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `feedback_id_index` (`feedback_id`),
  KEY `unresolved_report_id_idx` (`unresolved_report_id`),
  CONSTRAINT `foreign_feedback_id` FOREIGN KEY (`feedback_id`) REFERENCES `user_feedback` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `foreign_unresolved_report_id` FOREIGN KEY (`unresolved_report_id`) REFERENCES `unresolved_report` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table clustering_tag
# ------------------------------------------------------------

CREATE TABLE `clustering_tag` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `report_id` bigint(20) unsigned DEFAULT NULL,
  `clustering_id` int(10) unsigned DEFAULT NULL,
  `tag` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `report_id_idx` (`report_id`),
  CONSTRAINT `report_id` FOREIGN KEY (`report_id`) REFERENCES `unresolved_report` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table unresolved_report
# ------------------------------------------------------------

CREATE TABLE `unresolved_report` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `created_time` timestamp NULL DEFAULT current_timestamp(),
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 0,
  `appid` varchar(64) NOT NULL,
  `type` tinyint(4) DEFAULT 0 COMMENT 'chat record 类型，0为未匹配，1为未解决',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `unique_task` (`start_time`,`end_time`,`appid`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table user_feedback
# ------------------------------------------------------------

CREATE TABLE `user_feedback` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `std_question` varchar(1024) DEFAULT NULL,
  `created_time` timestamp NULL DEFAULT current_timestamp(),
  `updated_time` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `appid` varchar(64) NOT NULL,
  `record_id` bigint(11) unsigned NOT NULL,
  `type` tinyint(4) DEFAULT 0 COMMENT 'chat record 类型，0为未匹配，1为未解决',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `record_type_UNIQUE` (`record_id`,`type`),
  KEY `created_time_index` (`created_time`),
  KEY `type_idx` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
