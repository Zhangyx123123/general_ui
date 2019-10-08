CREATE DATABASE IF NOT EXISTS backend_log CHARACTER SET utf8 COLLATE utf8_general_ci;
USE backend_log

CREATE TABLE IF NOT EXISTS `chat_record` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'chatlog id',
  `app_id` varchar(64) NOT NULL DEFAULT '' COMMENT '应用ID',
  `user_id` varchar(64) NOT NULL DEFAULT '' COMMENT '使用者id',
  `user_q` text COMMENT '用户提问',
  `std_q` varchar(255) NOT NULL DEFAULT '' COMMENT '标准问题',
  `answer` mediumtext COMMENT 'robot 答案',
  `module` varchar(32) NOT NULL DEFAULT '' COMMENT '出话模组',
  `emotion` varchar(32) NOT NULL DEFAULT '' COMMENT '情绪',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `log_time` varchar(32) NOT NULL DEFAULT '' COMMENT 'RFC3339时间格式',
  `score` int(11) NOT NULL DEFAULT '0' COMMENT '分数',
  `custom_info` text COMMENT '唯品会讯息',
  `host` varchar(32) NOT NULL DEFAULT '' COMMENT '纪录 log 来源机器',
  `unique_id` varchar(100) NOT NULL DEFAULT '' COMMENT '纪录 log ID',
  `note` text COMMENT '保留栏位',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='暂存所有对话纪录，每个对话(单句)将存成一条row，转存进vipshop_record后将此表内同一笔作删除';

CREATE TABLE IF NOT EXISTS `custom_statics` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '统计条目id',
  `date` date NOT NULL DEFAULT '1980-01-01' COMMENT '日期',
  `session_cnt` int(11) NOT NULL COMMENT '总会话数',
  `chat_user_cnt` int(11) NOT NULL COMMENT '聊天用户量',
  `active_user_cnt` int(11) NOT NULL COMMENT '活跃用户量',
  `new_user_cnt` int(11) NOT NULL COMMENT '新增用户量',
  `chat_cnt` int(11) NOT NULL COMMENT '对话量',
  `std_ans_cnt` int(11) NOT NULL COMMENT '出话为业务类, 并给出标准答案的数量 (module = faq)',
  `pure_chat_cnt` int(11) NOT NULL COMMENT '出话为聊天类的聊天数量 (module != faq, module != backfill)',
  `backfill_cnt` int(11) NOT NULL COMMENT '无法回答的数量',
  `unsolved_cnt` int(11) NOT NULL COMMENT '业务类中标记为未解决的问答数量',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `tag_type_id_str` varchar(100) DEFAULT NULL COMMENT '维度类型',
  `tag_id_str` varchar(100) DEFAULT NULL COMMENT '维度',
  PRIMARY KEY (`id`),
  KEY `date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `static_record_info` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  `unique_id` varchar(100) NOT NULL DEFAULT '' COMMENT 'chat_record id',
  `qa_solved` tinyint(1) NOT NULL DEFAULT '0' COMMENT '纪录被标记为解决or未解决',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='标记对话结果为解决或未解决';


CREATE TABLE IF NOT EXISTS `static_user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  `user_id` varchar(64) NOT NULL DEFAULT '' COMMENT '使用者id',
  `first_chat` datetime NOT NULL DEFAULT '2000-01-01 00:00:00' COMMENT '纪录第一次使用系统时间',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户使用纪录';


CREATE TABLE IF NOT EXISTS `statics` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '统计条目id',
  `date` date NOT NULL DEFAULT '1980-01-01' COMMENT '统计日期',
  `type` int(11) NOT NULL DEFAULT '0' COMMENT '统计类別 0:date 1:hour',
  `hour` int(11) NOT NULL DEFAULT '0' COMMENT '小时(0~23)',
  `chat_user_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '聊天用户量',
  `active_user_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '活跃用户量',
  `new_user_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '新增用户量',
  `session_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '对话session数量',
  `chat_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '对话量',
  `pure_chat_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '出话为聊天类的聊天数量 (module != faq, module != backfill)',
  `std_ans_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '出话为业务类, 并给出标准答案的数量 (module = faq)',
  `sensitive_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '用户问句命中敏感词的数量',
  `backfill_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '无法回答的数量',
  `solved_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '业务类中标记为解决的问答数量',
  `unsolved_cnt` int(11) NOT NULL DEFAULT '0' COMMENT '业务类中标记为未解决的问答数量',
  `top_std_q` mediumtext COMMENT '纪录top n标准问题的内容及资讯',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `top_unmatch_q` mediumtext COMMENT '纪录top n未匹配问题的内容及资讯',
  `top_unresolved_q` mediumtext COMMENT '纪录top n未解決问题的内容及资讯',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='统计资料';

CREATE TABLE IF NOT EXISTS `csbot_record` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT comment 'chatlog id',
  `app_id` varchar(64) NOT NULL DEFAULT '' comment '应用ID',
  `user_id` varchar(64) NOT NULL DEFAULT '' comment '使用者id',
  `user_q` text comment '用户提问',
  `std_q` varchar(255) NOT NULL DEFAULT '' comment '标准问题',
  `answer` mediumtext comment 'robot 答案',
  `module` varchar(32) NOT NULL DEFAULT '' comment '出话模组',
  `emotion` varchar(32) NOT NULL DEFAULT '' comment '情绪',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP comment '创建对话时间',
  `score` int(11) NOT NULL DEFAULT '0' comment '分数',
  `host` varchar(32) NOT NULL DEFAULT '' comment '纪录 log 来源机器',
  `unique_id` varchar(100) NOT NULL DEFAULT '' comment '纪录 log ID',
  `path` varchar(200) NOT NULL DEFAULT '' comment '标准问题之目录',
  `note` text comment '保留栏位',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='存放最终所有对话纪录，每个对话(单句)将存成一条row，并将 custom_info 资讯展开后储存，以利统计查询';