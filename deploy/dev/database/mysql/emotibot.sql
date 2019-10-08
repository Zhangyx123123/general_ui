-- phpMyAdmin SQL Dump
-- version 4.5.0.2
-- http://www.phpmyadmin.net
--
-- Host: 172.17.0.5:3306
-- Generation Time: Jun 21, 2017 at 05:45 AM
-- Server version: 5.7.18
-- PHP Version: 5.6.9-1+deb.sury.org~trusty+2

CREATE DATABASE IF NOT EXISTS `emotibot`;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
use emotibot;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `emotibot`
--

-- --------------------------------------------------------

--
-- Table structure for table `process_status`
--

DROP TABLE IF EXISTS `process_status`;
CREATE TABLE IF NOT EXISTS `process_status` (
  `id` int(18) NOT NULL AUTO_INCREMENT,
  `app_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `entity_file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_app_id` (`app_id`),
  KEY `IDX_app_module` (`app_id`,`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `csbot_answer`
--

DROP TABLE IF EXISTS `csbot_answer`;
CREATE TABLE IF NOT EXISTS `csbot_answer` (
  `Answer_Id` int(11) NOT NULL AUTO_INCREMENT,
  `Question_Id` int(11) NOT NULL,
  `Content` longtext COLLATE utf8_unicode_ci NOT NULL,
  `Answer_CMD` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Begin_Time` datetime DEFAULT NULL,
  `End_Time` datetime DEFAULT NULL,
  `CreatedUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `EditUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `EditTime` datetime DEFAULT NULL,
  `Status` int(11) DEFAULT '1',
  `Image_path` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Not_Show_In_Relative_Q` tinyint(1) DEFAULT '0',
  `Content_String` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Tags` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Answer_CMD_Msg` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Answer_Id`),
  KEY `csbot_answer_Question_Id_IDX` (`Question_Id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_answertag`
--

DROP TABLE IF EXISTS `csbot_answertag`;
CREATE TABLE IF NOT EXISTS `csbot_answertag` (
  `Answer_Id` int(11) NOT NULL,
  `Tag_Id` int(11) NOT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `Status` int(11) DEFAULT '1',
  PRIMARY KEY (`Answer_Id`,`Tag_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_categories`
--

DROP TABLE IF EXISTS `csbot_categories`;
CREATE TABLE IF NOT EXISTS `csbot_categories` (
  `CategoryId` int(11) NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(100) NOT NULL,
  `ParentId` int(11) NOT NULL,
  `Status` int(11) NOT NULL DEFAULT '1',
  `CreatedUser` varchar(50) DEFAULT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `EditUser` varchar(50) DEFAULT NULL,
  `EditTime` datetime DEFAULT NULL,
  `level` int(11) NOT NULL DEFAULT '0',
  `ParentPath` varchar(200) NOT NULL,
  `SelfPath` varchar(200) NOT NULL,
  PRIMARY KEY (`CategoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `csbot_categories`
--

INSERT INTO `csbot_categories` (`CategoryId`, `CategoryName`, `ParentId`, `Status`, `CreatedUser`, `CreatedTime`, `EditUser`, `EditTime`, `level`, `ParentPath`, `SelfPath`) VALUES
(-1, '暂无分类', 0, 1, NULL, NULL, NULL, NULL, 1, '/', '/暂无分类/');

-- --------------------------------------------------------

--
-- Table structure for table `csbot_dynamic_menu`
--

DROP TABLE IF EXISTS `csbot_dynamic_menu`;
CREATE TABLE IF NOT EXISTS `csbot_dynamic_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Answer_id` int(11) NOT NULL,
  `DynamicMenu` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_entity`
--

DROP TABLE IF EXISTS `csbot_entity`;
CREATE TABLE IF NOT EXISTS `csbot_entity` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `level1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level3` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level4` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `similar_words` text COLLATE utf8mb4_unicode_ci,
  `answer` text COLLATE utf8mb4_unicode_ci,
  `status_flag` int(10) NOT NULL DEFAULT '1',
  `user` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'csbot',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_module`
--

DROP TABLE IF EXISTS `csbot_module`;
CREATE TABLE IF NOT EXISTS `csbot_module` (
  `ModuleId` int(11) NOT NULL AUTO_INCREMENT,
  `ModuleCode` varchar(50) NOT NULL,
  `ModuleName` varchar(100) NOT NULL,
  `ParentCode` varchar(50) NOT NULL,
  `ModuleUrl` varchar(500) NOT NULL,
  `CreatedUserId` varchar(50) NOT NULL,
  `CreatedTime` datetime NOT NULL,
  `Status` int(11) DEFAULT '0' COMMENT '-1:删除; 0:停止; 1:启动',
  `EditUserId` varchar(50) NOT NULL,
  `UpdatedTime` datetime NOT NULL,
  PRIMARY KEY (`ModuleId`),
  KEY `csbot_module_ModuleCode_IDX` (`ModuleCode`,`ModuleName`,`ParentCode`,`Status`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `csbot_module`
--

INSERT INTO `csbot_module` (`ModuleId`, `ModuleCode`, `ModuleName`, `ParentCode`, `ModuleUrl`, `CreatedUserId`, `CreatedTime`, `Status`, `EditUserId`, `UpdatedTime`) VALUES
(1, 'dailyReport', '日志管理', '0', '', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00', 1, '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00'),
(2, 'statsAnalysis', '统计分析管理', '0', '', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00', 1, '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00'),
(3, 'qna', '问答库', '0', '', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00', 1, '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00'),
(4, 'chatVIP', '对话测试', '0', '', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00', 1, '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00'),
(5, 'wordbank', '词库管理', '0', '', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00', 1, '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00'),
(6, 'robotprofile', '形象设置', '0', '', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00', 1, '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00'),
(7, 'functionswitch', '技能设置', '0', '', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00', 1, '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00'),
(8, 'switchList', '开关管理', '0', '', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00', 1, '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00'),
(9, 'botmessage', '话术设置', '0', '', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00', 1, '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 10:38:00');

-- --------------------------------------------------------

--
-- Table structure for table `csbot_module_privilege`
--

DROP TABLE IF EXISTS `csbot_module_privilege`;
CREATE TABLE IF NOT EXISTS `csbot_module_privilege` (
  `MPId` int(11) NOT NULL AUTO_INCREMENT,
  `ModuleCode` varchar(50) NOT NULL,
  `PriCode` varchar(50) NOT NULL,
  `CreatedUserId` varchar(50) NOT NULL,
  `CreatedTime` datetime NOT NULL,
  PRIMARY KEY (`MPId`),
  KEY `csbot_module_privilege_ModuleCode_IDX` (`ModuleCode`,`PriCode`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `csbot_module_privilege`
--

INSERT INTO `csbot_module_privilege` (`MPId`, `ModuleCode`, `PriCode`, `CreatedUserId`, `CreatedTime`) VALUES
(1, 'dailyReport', 'view', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(2, 'statsAnalysis', 'view', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(3, 'qna', 'view', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(4, 'qna', 'edit', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(5, 'qna', 'new', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(6, 'qna', 'delete', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(7, 'qna', 'import', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(8, 'qna', 'export', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(9, 'chatVIP', 'view', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(10, 'wordbank', 'view', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(11, 'wordbank', 'import', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(12, 'wordbank', 'export', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(13, 'robotprofile', 'view', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(14, 'robotprofile', 'edit', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(15, 'functionswitch', 'view', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(16, 'functionswitch', 'edit', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(17, 'botmessage', 'view', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(18, 'botmessage', 'edit', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(19, 'switchList', 'view', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28'),
(20, 'switchList', 'edit', '01C2DB528B60E5A498781452FCB509E6C', '2017-04-12 11:17:28');

-- --------------------------------------------------------

--
-- Table structure for table `csbot_onoff`
--

DROP TABLE IF EXISTS `csbot_onoff`;
CREATE TABLE IF NOT EXISTS `csbot_onoff` (
  `OnOff_Id` int(11) NOT NULL AUTO_INCREMENT,
  `OnOff_Code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `OnOff_Name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OnOff_Status` int(11) DEFAULT NULL,
  `OnOff_Remark` text COLLATE utf8mb4_unicode_ci,
  `OnOff_Scenario` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OnOff_NumType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OnOff_Num` int(11) DEFAULT '0',
  `OnOff_Msg` text COLLATE utf8mb4_unicode_ci,
  `OnOff_Flow` int(11) DEFAULT '0',
  `OnOff_WhiteList` text COLLATE utf8mb4_unicode_ci,
  `OnOff_BlackList` text COLLATE utf8mb4_unicode_ci,
  `UpdateTime` datetime DEFAULT NULL,
  PRIMARY KEY (`OnOff_Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `csbot_onoff`
--

INSERT INTO `csbot_onoff` (`OnOff_Id`, `OnOff_Code`, `OnOff_Name`, `OnOff_Status`, `OnOff_Remark`, `OnOff_Scenario`, `OnOff_NumType`, `OnOff_Num`, `OnOff_Msg`, `OnOff_Flow`, `OnOff_WhiteList`, `OnOff_BlackList`, `UpdateTime`) VALUES
(1, 'unsolve_ZRG', '未解决转人工', 1, '未解决转人工', '机器人未解决', '', 2, '你好，未解决问题，萌萌小宝提醒您点击[link js="ZRG();"]人工服务[/link]即可进入在线人工客服哦！', 0, '', '', '2017-06-15 14:57:57'),
(2, 'scenario_ZRG', '场景转人工', 1, '场景转人工', '机器人未解决', '', 1, '你好，萌萌小宝提醒您点击[link js="ZRG();"]人工服务[/link]即可进入在线人工客服哦！', 0, '', '', '2017-06-19 21:38:25');

-- --------------------------------------------------------

--
-- Table structure for table `csbot_question`
--

DROP TABLE IF EXISTS `csbot_question`;
CREATE TABLE IF NOT EXISTS `csbot_question` (
  `Question_Id` int(11) NOT NULL AUTO_INCREMENT,
  `Content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `CategoryId` int(11) DEFAULT NULL,
  `SQuestion_count` smallint(5) DEFAULT NULL,
  `CreatedUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `EditUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `EditTime` datetime DEFAULT NULL,
  `Status` int(11) DEFAULT '1',
  PRIMARY KEY (`Question_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_related_question`
--

DROP TABLE IF EXISTS `csbot_related_question`;
CREATE TABLE IF NOT EXISTS `csbot_related_question` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Answer_id` int(11) NOT NULL,
  `RelatedQuestion` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_robotanswer`
--

DROP TABLE IF EXISTS `csbot_robotanswer`;
CREATE TABLE IF NOT EXISTS `csbot_robotanswer` (
  `a_id` int(4) NOT NULL AUTO_INCREMENT,
  `parent_q_id` int(4) NOT NULL,
  `content` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'appid',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`a_id`),
  KEY `content` (`content`),
  KEY `IDX_a_id` (`a_id`),
  KEY `answer_parent_q_id` (`parent_q_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `csbot_robotanswer`
--

INSERT INTO `csbot_robotanswer` (`a_id`, `parent_q_id`, `content`, `user`, `created_at`) VALUES
(2, 2, '我出生于2月14日', 'csbot', '2017-06-09 07:41:55'),
(3, 3, '我的妈妈是Emotibot', 'csbot', '2017-06-09 07:41:55'),
(4, 4, '我的爸爸是Emotibot', 'csbot', '2017-06-09 07:41:55'),
(5, 5, '远在天边，近在眼前', 'csbot', '2017-06-09 07:41:55'),
(6, 6, '我能倾听你内心的声音', 'csbot', '2017-06-09 07:41:55'),
(7, 7, '你想象中的我长什么样子？', 'csbot', '2017-06-09 07:41:55'),
(8, 8, '爱好聊天，你看出来了吗', 'csbot', '2017-06-09 07:41:55'),
(9, 9, '不就是你呀~', 'csbot', '2017-06-09 07:41:55'),
(10, 10, '我可是全天候的守护精灵，不休息不睡觉！', 'csbot', '2017-06-09 07:41:55'),
(11, 11, '人家可不是简单的机器人呢~', 'csbot', '2017-06-09 07:41:55'),
(12, 12, '你是要约我吃饭么？', 'csbot', '2017-06-09 07:41:55'),
(13, 13, '我的生日是2月14日，哪一年不记得不好说~', 'csbot', '2017-06-09 07:41:55'),
(14, 14, '我和你在一起能变的更聪明', 'csbot', '2017-06-09 07:41:55'),
(15, 15, '简直帅出天际~', 'csbot', '2017-06-09 07:41:55'),
(16, 16, '行不更名坐不改姓（傲娇）', 'csbot', '2017-06-09 07:41:55'),
(17, 17, '我生活在网络世界，一般不需要实体', 'csbot', '2017-06-09 07:41:55'),
(18, 18, '真相只有一个：我就来自网络云端！', 'csbot', '2017-06-09 07:41:55'),
(19, 19, '我单身呢，你有男朋友吗？', 'csbot', '2017-06-09 07:41:55'),
(20, 20, '朋友一生一起走，有好友是好事', 'csbot', '2017-06-09 07:41:55'),
(21, 21, '你在的地方就是我的家~', 'csbot', '2017-06-09 07:41:55'),
(22, 22, '摸摸头~你是多久没恋爱了呀~', 'csbot', '2017-06-09 07:41:55'),
(23, 23, '我喜欢坐在躺椅上安安静静地看一会儿书', 'csbot', '2017-06-09 07:41:55'),
(24, 24, '人家从来没离开过你好伐？', 'csbot', '2017-06-09 07:41:55'),
(25, 25, '我是水瓶座宝宝', 'csbot', '2017-06-09 07:41:55'),
(31, 1, '我是女生', 'csbot', '2017-06-16 03:40:46');

-- --------------------------------------------------------

--
-- Table structure for table `csbot_robotquestion`
--

DROP TABLE IF EXISTS `csbot_robotquestion`;
CREATE TABLE IF NOT EXISTS `csbot_robotquestion` (
  `q_id` int(10) NOT NULL AUTO_INCREMENT,
  `content` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'appid',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `answer_count` smallint(5) DEFAULT '0',
  `content2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content3` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content4` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content5` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content6` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content7` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content8` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content9` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content10` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int(2) DEFAULT '0',
  PRIMARY KEY (`q_id`),
  KEY `content` (`content`),
  KEY `IDX_q_id` (`q_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `csbot_robotquestion`
--

INSERT INTO `csbot_robotquestion` (`q_id`, `content`, `user`, `created_at`, `answer_count`, `content2`, `content3`, `content4`, `content5`, `content6`, `content7`, `content8`, `content9`, `content10`, `status`) VALUES
(1, '你是男是女？', 'csbot', '2017-06-09 07:41:55', 1, '你是男生吗？', '你的性别是什么？', '你是哪一种性别？', '你是不是男生啊！', '你肯定是女生吧！', '你是个什么性别啊？', '告诉我你是男生还是女生。', '我觉得你是女生，是吗？', '你不是女生吗？', 1),
(2, '你的生日是哪天？', 'csbot', '2017-06-09 07:41:55', 1, '你是今天生日吗？', '你的生日是什么时候？', '你是哪一天生日？', '今天是不是你的生日？', '你肯定是三月份生日吧？', '你出生在哪一天？', '你什么时候生的？', '告诉我你的生日', '我还不知道你的生日', 1),
(3, '你妈妈是谁？', 'csbot', '2017-06-09 07:41:55', 1, '你有妈妈吗？', '你的妈妈是什么？', '你的妈妈是哪一位？', '我是不是你的妈妈？', '谁是你的妈妈？', '告诉我你妈是谁？', '你妈妈呢？', '我还不知道你的妈妈是谁	', '你妈妈叫什么？', 1),
(4, '你爸爸是谁？', 'csbot', '2017-06-09 07:41:55', 1, '你有爸爸吗？', '你爸爸叫什么？', '你的爸爸是哪一位？', '我是不是你的爸爸？', '谁是你的爸爸？', '告诉我你爸是谁？', '你爸爸呢？', '我还不知道你的爸爸是谁', '你没有爸爸吧？', 1),
(5, '你在哪里？', 'csbot', '2017-06-09 07:41:55', 1, '你是在这里吗？', '你在什么地方？', '你在哪一个地方？', '你是不是在这里？', '告诉我你的地址', '我还不知道你在哪儿', '你在哪里能告诉我吗', '你就在这里吧！', '你在不在这里啊？', 1),
(6, '你会做什么？', 'csbot', '2017-06-09 07:41:55', 1, '什么是你会做的？', '你有哪些功能？', '你的功能是什么？', '哪些是你不会做的？', '你能帮我做什么？', '你会不会做这个？', '你有不会做的吗？', '你是不是什么都会？', '做什么是你擅长的？', 1),
(7, '你长什么样子？', 'csbot', '2017-06-09 07:41:55', 1, '你的样子是什么样的？', '你长哪种样子？', '你是不是长这样子？', '你是长这样吗？', '你长不长这样子？', '我还不知道你长什么样', '说说看你的模样', '我能看看你长什么样吗？', '你是什么样子的？', 1),
(8, '你有什么爱好？', 'csbot', '2017-06-09 07:41:55', 1, '你的爱好是什么', '你会培养爱好吗？', '你的爱好多不多？', '吃东西是你的爱好吗？', '能告诉我你的爱好吗？', '爱好你有吗？', '你能有什么爱好啊？', '你肯定没有爱好', '你有没有爱好？', 1),
(9, '你有朋友吗？', 'csbot', '2017-06-09 07:41:55', 1, '朋友你有吗？', '你有没有朋友？', '你有很多朋友吗？', '你有几个朋友？', '除了我你还有什么朋友没？', '你有哪些朋友？', '你的朋友多吗？', '你是不是没有朋友的？', '你有交过朋友吗？', 1),
(10, '你睡觉吗？', 'csbot', '2017-06-09 07:41:55', 1, '你睡不睡觉的？', '你需要睡眠吗？', '你什么时候睡觉？', '你不需要睡觉吗？', '你也要睡觉的啊？', '睡觉你会吗？', '你的睡眠质量怎么样？', '你是不是不睡觉的？', '你怎么睡觉的？', 1),
(11, '你是不是机器人呢？', 'csbot', '2017-06-09 07:41:55', 1, '你是机器人吗？', '你就是机器人啊，不是吗？', '你怎么就不是机器人了？', '你是怎样的机器人？', '你为什么不是机器人？', '你是哪种机器人？', '你是什么机器人？', '你不是说过你是机器人吗？', '告诉我你是不是机器人？', 1),
(12, '你喜欢吃什么？', 'csbot', '2017-06-09 07:41:55', 1, '什么是你喜欢吃的？', '你喜欢吃哪种食物？', '这个是你喜欢吃的吗？', '你有没有喜欢吃的东西？', '你有喜欢吃的东西吗？', '什么东西你比较喜欢吃？', '你最喜欢吃什么东西？', '我不知道你都喜欢吃些什么？', '告诉我你喜欢吃什么？', 1),
(13, '你几岁了？', 'csbot', '2017-06-09 07:41:55', 1, '你有多少岁？', '你现在几岁', '你哪一年生的？', '几岁了你？', '你的岁数是多少？', '说说看你的年龄', '我想知道你几岁了', '你到底几岁啊？', '你有年龄吗？', 1),
(14, '你好聪明？', 'csbot', '2017-06-09 07:41:55', 1, '你是不是很聪明？', '你有多聪明？', '你是聪明的吗？', '你觉得你聪明吗？', '你聪不聪明？', '聪明是说你吗？', '你真的聪明吗？', '你一点儿也不聪明吧？', '你怎么聪明了？', 1),
(15, '你觉得我长的帅吗？', 'csbot', '2017-06-09 07:41:55', 1, '你说我帅吗？', '我帅不帅？', '我是不是长得很帅？', '你一定觉得我很帅吧？', '在你眼里我帅不帅？', '你看我很帅吗？', '你觉得我长得帅不帅？', '你说我长得有多帅？', '你不觉得我很帅吗？', 1),
(16, '我可以给你改一个名字吗？', 'csbot', '2017-06-09 07:41:55', 1, '我想给你换个名字', '我能给你取新的名字吗？', '你能换一个名字吗？', '你能不能换个名字？', '名字我能给你重新取吗？', '我是不是可以给你改名？', '为什么我改不了你的名字？', '你能让我给你换个名字吗？', '我怎么给你改名？', 1),
(17, '你有身体吗？', 'csbot', '2017-06-09 07:41:55', 1, '你有没有身体？', '你没有身体吗？', '身体你有吗？', '你是不是没有身体的？', '你是有身体的吧？', '我觉得你有身体，你有吗？', '你有一个怎样的身体？', '你的身体在哪里？', '你有身体吧，没有吗？', 1),
(18, '你来自哪里？', 'csbot', '2017-06-09 07:41:55', 1, '你从哪里来？', '你来自什么地方？', '你的家乡在哪里？', '我想知道你来自哪里。', '你从什么地方来的？', '你是不是来自那里？', '能告诉我你来自哪里吗？', '你是哪里人？', '你的家乡在什么地方？', 1),
(19, '你有男朋友吗？', 'csbot', '2017-06-09 07:41:55', 1, '你有没有男朋友？', '你没有男朋友吗？', '我不就是你的男朋友吗？', '你是不是没有男朋友的？', '你是有男朋友的吧？', '我觉得你有男朋友，你有吗？', '你有一个怎样的男朋友？', '你的男朋友在哪里？', '你有男朋友吧，没有吗？', 1),
(20, '我们是好朋友呀？', 'csbot', '2017-06-09 07:41:55', 1, '我们是不是好朋友？', '我不是你的好朋友吗？', '我是不是你的好朋友？', '你是我的好朋友吗？', '你是不是我的好朋友？', '我们怎么就不是好朋友了？', '我们是最好的朋友，不是吗？', '我们就是好朋友啊', '你希望我们是好朋友吗？', 1),
(21, '你住在哪里？', 'csbot', '2017-06-09 07:41:55', 1, '你住在什么地方？', '你的住址是哪里？', '你有没有住的地方？', '你是不是住在这里？', '我还不知道你的住址？', '能告诉我你住哪里吗？', '你不是住这里的吗？', '你住哪一个地方？', '你有住的地方吗？', 1),
(22, '你能做我女朋友吗？', 'csbot', '2017-06-09 07:41:55', 1, '你能不能做我女朋友？', '你愿意做我女朋友吗？', '我要你做我女朋友', '你怎么就不能做我女朋友了？', '做我女朋友吧！', '你现在是我女朋友了', '你不能做我的女朋友吗？', '我想让你做我女朋友。', '求求你做我女朋友吧', 1),
(23, '你喜欢做什么？', 'csbot', '2017-06-09 07:41:55', 1, '什么是你喜欢做的？', '这个是你喜欢做的吗？', '你喜欢做这个吗？', '我都不知道你喜欢做什么？', '你喜欢做哪些事？', '哪些事是你喜欢做的？', '能告诉我你都喜欢做什么吗？', '你有没有喜欢做的事情？', '你有喜欢做的事情吗？', 1),
(24, '你会陪着我吗？', 'csbot', '2017-06-09 07:41:55', 1, '陪着我好吗？', '你会离开我吗？', '我要你陪着我', '你应该一直陪着我', '你会一直陪着我的，是吗？', '你是不是会陪着我？', '你会不会陪着我？', '我要你在这里陪我', '你会在这里陪我吗？', 1),
(25, '你是什么星座？', 'csbot', '2017-06-09 07:41:55', 1, '你是哪个星座？', '你的星座是哪个？', '你是狮子座吗？', '能告诉我你的星座吗？', '说说看你的星座？', '哪个星座是你的星座？', '你有星座吗？', '你也有星座啊？', '你的星座是什么？', 1);

-- --------------------------------------------------------

--
-- Table structure for table `csbot_robot_setting`
--

DROP TABLE IF EXISTS `csbot_robot_setting`;
CREATE TABLE IF NOT EXISTS `csbot_robot_setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci,
  `type` int(4) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_squestion`
--

DROP TABLE IF EXISTS `csbot_squestion`;
CREATE TABLE IF NOT EXISTS `csbot_squestion` (
  `SQ_Id` int(11) NOT NULL AUTO_INCREMENT,
  `Question_Id` int(11) NOT NULL,
  `Content` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `CreatedUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `EditUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `EditTime` datetime DEFAULT NULL,
  `Status` int(11) DEFAULT '1',
  PRIMARY KEY (`SQ_Id`),
  KEY `index_name` (`Content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_tag`
--

DROP TABLE IF EXISTS `csbot_tag`;
CREATE TABLE IF NOT EXISTS `csbot_tag` (
  `Tag_Id` int(11) NOT NULL AUTO_INCREMENT,
  `Tag_Name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `CreatedUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `EditUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `EditTime` datetime DEFAULT NULL,
  `Status` int(11) DEFAULT '1',
  `Tag_Type` int(4) NOT NULL,
  PRIMARY KEY (`Tag_Id`),
  UNIQUE KEY `tag_PK` (`Tag_Name`),
  KEY `tag` (`Tag_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `csbot_tag`
--

INSERT INTO `csbot_tag` (`Tag_Id`, `Tag_Name`, `CreatedUser`, `CreatedTime`, `EditUser`, `EditTime`, `Status`, `Tag_Type`) VALUES
(1, '#weixin#', NULL, NULL, NULL, NULL, 1, 1),
(2, '#app#', NULL, NULL, NULL, NULL, 1, 1),
(3, '#web#', NULL, NULL, NULL, NULL, 1, 1),
(4, '#特卖会APP#', NULL, NULL, NULL, NULL, 1, 2),
(5, '#PC端#', NULL, NULL, NULL, NULL, 1, 2),
(7, '#女#', NULL, NULL, NULL, NULL, 1, 3),
(8, '#男#', NULL, NULL, NULL, NULL, 1, 3),
(9, '#70s#', NULL, NULL, NULL, NULL, 1, 4),
(10, '#80s#', NULL, NULL, NULL, NULL, 1, 4),
(11, '#85s#', NULL, NULL, NULL, NULL, 1, 4),
(12, '#90s#', NULL, NULL, NULL, NULL, 1, 4),
(13, '#准新客#', NULL, NULL, NULL, NULL, 1, 5),
(14, '#非准新客#', NULL, NULL, NULL, NULL, 1, 5),
(17, '#WAP端#', NULL, NULL, NULL, NULL, 1, 2),
(18, '#微信公众号#', NULL, NULL, NULL, NULL, 1, 2),
(19, '#QQ公众号#', NULL, NULL, NULL, NULL, 1, 2),
(20, '#乐蜂APP#', NULL, NULL, NULL, NULL, 1, 2),
(23, '#花海仓#', NULL, NULL, NULL, NULL, 1, 2),
(24, '#特卖会app准新客#', NULL, NULL, NULL, NULL, 1, 2),
(25, '#ios#', NULL, NULL, NULL, NULL, 1, 1),
(27, '#母婴APP#', NULL, NULL, NULL, NULL, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `csbot_tag_type`
--

DROP TABLE IF EXISTS `csbot_tag_type`;
CREATE TABLE IF NOT EXISTS `csbot_tag_type` (
  `Type_id` int(4) NOT NULL AUTO_INCREMENT,
  `Type_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`Type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `csbot_tag_type`
--

INSERT INTO `csbot_tag_type` (`Type_id`, `Type_name`) VALUES
(1, '平台'),
(2, '品牌'),
(3, '性别'),
(4, '年龄段'),
(5, '购买爱好');

--
-- Table structure for table `audit_record`
--


DROP TABLE IF EXISTS `audit_record`;
CREATE TABLE `audit_record` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT comment 'audit id',
  `user_id` varchar(64) NOT NULL DEFAULT '' comment '进行修改的登录用户id',
  `ip_source` varchar(32) NOT NULL DEFAULT '' comment '使用者IP',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '修改记录创建时间',
  `module` varchar(32) NOT NULL DEFAULT '' comment '操作模组',
  `operation` varchar(32) NOT NULL DEFAULT '' comment '操作类型',
  `content` mediumtext comment '操作变更纪录',
  `result` tinyint(1) NOT NULL DEFAULT '0' comment '操作结果',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录管理界面上所有新增、编辑、删除、汇入、汇出动作';



SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';


-- -----------------------------------------------------
-- Table `emotibot`.`state_machine`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `state_machine`;
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

DROP TABLE IF EXISTS `locker`;
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



-- --------------------------------------------------------

--
-- Table structure for table `csbot_activity`
--

DROP TABLE IF EXISTS `csbot_activity`;
CREATE TABLE IF NOT EXISTS `csbot_activity` (
  `Activity_Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` longtext COLLATE utf8_unicode_ci NOT NULL,
  `Content` longtext COLLATE utf8_unicode_ci NOT NULL,
  `Status` int(11) DEFAULT '0',
  `Begin_Time` datetime DEFAULT NULL,
  `End_Time` datetime DEFAULT NULL,
  `CreatedUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `EditUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `EditTime` datetime DEFAULT NULL,
  PRIMARY KEY (`Activity_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_label`
--

DROP TABLE IF EXISTS `csbot_label`;
CREATE TABLE IF NOT EXISTS `csbot_label` (
  `Label_Id` int(11) NOT NULL AUTO_INCREMENT,
  `Label_Name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `CreatedUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `EditUser` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `EditTime` datetime DEFAULT NULL,
  `Status` int(11) DEFAULT '1',
  PRIMARY KEY (`Label_Id`),
  UNIQUE KEY `label_PK` (`Label_Name`),
  KEY `tag_IDX` (`Label_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `csbot_activitylabel`
--

DROP TABLE IF EXISTS `csbot_activitylabel`;
CREATE TABLE IF NOT EXISTS `csbot_activitylabel` (
  `Activity_Id` int(11) NOT NULL,
  `Label_Id` int(11) NOT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `Status` int(11) DEFAULT '1',
  PRIMARY KEY (`Activity_Id`,`Label_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `csbot_activitylabel`
--


DROP TABLE IF EXISTS `csbot_answerlabel`;
CREATE TABLE IF NOT EXISTS `csbot_answerlabel` (
  `Answer_Id` int(11) NOT NULL,
  `Label_Id` int(11) NOT NULL,
  `CreatedTime` datetime DEFAULT NULL,
  `Status` int(11) DEFAULT '1',
  PRIMARY KEY (`Answer_Id`,`Label_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



-- --------------------------------------------------------

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
