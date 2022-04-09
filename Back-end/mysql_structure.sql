 CREATE TABLE `players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `score` int DEFAULT '0',
  PRIMARY KEY (`id`)
);


CREATE TABLE `rounds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `number` int NOT NULL,
  `starttime` int DEFAULT '0',
  `winnername` text,
  `winnertime` int DEFAULT '0',
  PRIMARY KEY (`id`)
);

CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nextfetchtime` int DEFAULT '0',
  `lockprocess` int DEFAULT '0',
  `lastscoreupdatetime` int DEFAULT '0',
  PRIMARY KEY (`id`)
);