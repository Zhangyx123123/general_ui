--
-- Table structure for table `taskengineapp`
--

DROP TABLE IF EXISTS `taskengineapp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taskengineapp` (
  `pk` varchar(90) NOT NULL,
  `appID` varchar(50) NOT NULL,
  `scenarioID` varchar(50) NOT NULL,
  PRIMARY KEY (`pk`),
  KEY `appID` (`appID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `taskenginemappingtable`
--

DROP TABLE IF EXISTS `taskenginemappingtable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taskenginemappingtable` (
  `mapping_table_name` varchar(50) NOT NULL,
  `update_time` datetime NOT NULL,
  `update_user` varchar(50) DEFAULT NULL,
  `content` mediumtext NOT NULL,
  PRIMARY KEY (`mapping_table_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `taskenginescenario`
--

DROP TABLE IF EXISTS `taskenginescenario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taskenginescenario` (
  `scenarioID` varchar(50) NOT NULL,
  `userID` varchar(50) NOT NULL,
  `appID` varchar(50) DEFAULT NULL,
  `content` mediumtext,
  `layout` mediumtext,
  `public` int(11) NOT NULL DEFAULT '0',
  `editing` tinyint(1) NOT NULL DEFAULT '0',
  `editingContent` mediumtext,
  `editingLayout` mediumtext,
  `updatetime` datetime NOT NULL DEFAULT NOW(),
  `onoff` int(11) DEFAULT '1',
  PRIMARY KEY (`scenarioID`),
  KEY `userID` (`userID`),
  KEY `public` (`public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
