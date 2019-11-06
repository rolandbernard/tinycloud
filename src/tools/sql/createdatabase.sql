
DROP DATABASE IF EXISTS :databasename;

CREATE DATABASE :databasename;

USE :databasename;

CREATE TABLE users (
    uruuid BINARY(16) NOT NULL PRIMARY KEY,
    uruname TEXT NOT NULL,
    urpasswdhash CHAR(60) NOT NULL,
    uravatar BLOB
);

CREATE TABLE entrys (
    eyuuid BINARY(16) NOT NULL PRIMARY KEY,
    eyparentuuid BINARY(16),
    uruuid BINARY(16) NOT NULL,
    FOREIGN KEY (eyparentuuid)
        REFERENCES entrys(eyuuid)
        ON DELETE CASCADE,
    FOREIGN KEY (uruuid)
        REFERENCES users(uruuid)
        ON DELETE CASCADE
);

CREATE TABLE folders (
    eyuuid BINARY(16) NOT NULL PRIMARY KEY,
    fdname TEXT NOT NULL,
    FOREIGN KEY (eyuuid)
        REFERENCES entrys(eyuuid)
        ON DELETE CASCADE
);

CREATE TABLE files (
    eyuuid BINARY (16) NOT NULL PRIMARY KEY,
    flname TEXT NOT NULL,
    flcontenttype TEXT NOT NULL,
    flsize INTEGER NOT NULL,
    fldata LONGBLOB NOT NULL,
    FOREIGN KEY (eyuuid)
        REFERENCES entrys(eyuuid)
        ON DELETE CASCADE
);

CREATE TABLE shares (
    shuuid BINARY(16) NOT NULL PRIMARY KEY,
    shaccesslevel ENUM('r','rw','rwd') NOT NULL,
    uruuid BINARY(16),
    eyuuid BINARY(16) NOT NULL,
    FOREIGN KEY (uruuid)
        REFERENCES users(uruuid)
        ON DELETE CASCADE,
    FOREIGN KEY (eyuuid)
        REFERENCES entrys(eyuuid)
        ON DELETE CASCADE
);

CREATE TABLE sharelinks (
    eyuuid BINARY(16) NOT NULL PRIMARY KEY,
    shuuid BINARY(16) NOT NULL,
    FOREIGN KEY (eyuuid)
        REFERENCES entrys(eyuuid)
        ON DELETE CASCADE,
    FOREIGN KEY (shuuid)
        REFERENCES shares(shuuid)
        ON DELETE CASCADE
);

CREATE TABLE history (
    hruuid BINARY(16) NOT NULL PRIMARY KEY,
    eyuuid BINARY(16) NOT NULL,
    uruuid BINARY(16) NOT NULL,
    hrdatetime DATETIME NOT NULL,
    hrtype ENUM('create','rename','update', 'move') NOT NULL,
    FOREIGN KEY (eyuuid)
        REFERENCES entrys(eyuuid)
        ON DELETE CASCADE,
    FOREIGN KEY (uruuid)
        REFERENCES users(uruuid)
        ON DELETE CASCADE
);

CREATE FUNCTION bin_to_uuid(_bin BINARY(16)) 
    RETURNS CHAR(36)
    LANGUAGE SQL  DETERMINISTIC  CONTAINS SQL  SQL SECURITY INVOKER
RETURN
    LCASE(
        CONCAT_WS('-',
            HEX(SUBSTR(_bin,  5, 4)),
            HEX(SUBSTR(_bin,  3, 2)),
            HEX(SUBSTR(_bin,  1, 2)),
            HEX(SUBSTR(_bin,  9, 2)),
            HEX(SUBSTR(_bin, 11))
        )
    );

CREATE FUNCTION uuid_to_bin(_uuid CHAR(36))
    RETURNS BINARY(16)
    LANGUAGE SQL  DETERMINISTIC  CONTAINS SQL  SQL SECURITY INVOKER
RETURN
    UNHEX(
        CONCAT(
            SUBSTR(_uuid, 15, 4),
            SUBSTR(_uuid, 10, 4),
            SUBSTR(_uuid,  1, 8),
            SUBSTR(_uuid, 20, 4),
            SUBSTR(_uuid, 25)
        )
    );
