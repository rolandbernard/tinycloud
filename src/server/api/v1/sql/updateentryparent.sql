UPDATE entrys AS ey
    SET ey.eyparentuuid = UUID_TO_BIN(:parentuuid)
    WHERE ey.eyuuid = UUID_TO_BIN(:entryuuid);

INSERT INTO history(hruuid, eyuuid, uruuid, hrdatetime, hrtype)
    VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(:entryuuid), UUID_TO_BIN(:useruuid), NOW(), 'move');