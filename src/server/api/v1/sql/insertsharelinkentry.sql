INSERT INTO entrys(eyuuid, eyparentuuid, uruuid)
    VALUES (UUID_TO_BIN(:uuid), UUID_TO_BIN(:parentuuid), UUID_TO_BIN(:useruuid));

INSERT INTO sharelinks(eyuuid, shuuid)
    VALUES (UUID_TO_BIN(:uuid), UUID_TO_BIN(:shareuuid));