UPDATE files AS fl
    SET fl.flsize = :size,
        fl.flcontenttype = :contenttype,
        fl.fldata = :data
    WHERE fl.eyuuid = UUID_TO_BIN(:entryuuid);

INSERT INTO history(hruuid, eyuuid, uruuid, hrdatetime, hrtype)
    VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(:entryuuid), UUID_TO_BIN(:useruuid), NOW(), 'update');