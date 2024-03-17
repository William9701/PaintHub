-- prepares a MySQL server for the project

CREATE DATABASE IF NOT EXISTS paintHub_dev_db;
CREATE USER IF NOT EXISTS 'paintHub_dev'@'localhost' IDENTIFIED BY 'paintHub_dev_pwd';
GRANT ALL PRIVILEGES ON `paintHub_dev_db`.* TO 'paintHub_dev'@'localhost';
GRANT SELECT ON `performance_schema`.* TO 'paintHub_dev'@'localhost';
FLUSH PRIVILEGES;
