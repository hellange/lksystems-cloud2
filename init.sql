CREATE DATABASE IF NOT EXISTS helge99;
USE helge99;
CREATE TABLE IF NOT EXISTS samples99 (creation_time DATETIME DEFAULT CURRENT_TIMESTAMP,thermostats json DEFAULT NULL);
