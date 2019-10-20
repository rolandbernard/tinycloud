
CREATE DATABASE tinycloud;

USE tinycloud;

CREATE TABLE users (
    uid BINARY(16) NOT NULL PRIMARY KEY,
    uusername VARCHAR(255) NOT NULL UNIQUE,
    upasswdhash CHAR(60) NOT NULL,
    uavatar BLOB
);

CREATE TABLE entrys (
    eid BINARY(16) NOT NULL PRIMARY KEY,
    ename VARCHAR(255) NOT NULL,
    eparentid BINARY(16),
    eownerid BINARY(16) NOT NULL,
    etype ENUM('file', 'folder') NOT NULL,
    FOREIGN KEY (eparentid) REFERENCES entrys(eid) ON DELETE CASCADE,
    FOREIGN KEY (eownerid) REFERENCES users(uid) ON DELETE CASCADE
);

CREATE TABLE files (
    fid BINARY(16) NOT NULL PRIMARY KEY,
    fentryid BINARY(16) NOT NULL UNIQUE,
    fcontenttype VARCHAR(255) NOT NULL,
    ffilesize INTEGER NOT NULL,
    fdata LONGBLOB NOT NULL,
    FOREIGN KEY (fentryid) REFERENCES entrys(eid) ON DELETE CASCADE
);

CREATE TABLE shares (
    sid BINARY(16) NOT NULL PRIMARY KEY,
    sentryid BINARY(16) NOT NULL,
    usharewithid BINARY(16), -- NULL if shared with all
    stype ENUM('readonly', 'readwrite', 'readwritedelete') NOT NULL,
    FOREIGN KEY (sentryid) REFERENCES entrys(eid) ON DELETE CASCADE,
    FOREIGN KEY (usharewithid) REFERENCES users(uid) ON DELETE CASCADE
);

CREATE TABLE sharepoints (
    spid BINARY(16) NOT NULL PRIMARY KEY,
    spmountedbyid BINARY(16) NOT NULL,
    spparentid BINARY(16),
    spshareid BINARY(16) NOT NULL,
    FOREIGN KEY (spmountedbyid) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (spparentid) REFERENCES entrys(eid) ON DELETE CASCADE,
    FOREIGN KEY (spshareid) REFERENCES shares(sid) ON DELETE CASCADE
);

CREATE TABLE history (
    hid BINARY(16) NOT NULL PRIMARY KEY,
    hentryid BINARY(16) NOT NULL,
    huserid BINARY(16) NOT NULL,
    hdatetime DATETIME NOT NULL,
    hoperation ENUM('create', 'rename', 'update') NOT NULL,
    FOREIGN KEY (hentryid) REFERENCES entrys(eid) ON DELETE CASCADE,
    FOREIGN KEY (huserid) REFERENCES users(uid) ON DELETE CASCADE
);

DELIMITER //
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
//

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
//
DELIMITER ;


