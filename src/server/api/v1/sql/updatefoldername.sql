UPDATE folders AS fd
    SET fd.fdname = :name
    WHERE fd.eyuuid = UUID_TO_BIN(:entryuuid);

INSERT INTO history(hruuid, eyuuid, uruuid, hrdatetime, hrtype)
    VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(:entryuuid), UUID_TO_BIN(:useruuid), NOW(), 'rename');