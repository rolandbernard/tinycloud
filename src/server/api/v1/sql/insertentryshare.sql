INSERT INTO shares(shuuid, shaccesslevel, uruuid, eyuuid)
    VALUES (UUID_TO_BIN(UUID()), :accesslevel, UUID_TO_BIN(:useruuid), UUID_TO_BIN(:entryuuid));