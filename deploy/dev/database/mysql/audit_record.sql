CREATE DATABASE IF NOT EXISTS `emotibot` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `emotibot`;

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
