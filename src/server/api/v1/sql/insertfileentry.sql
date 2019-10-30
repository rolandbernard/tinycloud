INSERT INTO entrys(eyuuid, eyparentuuid, uruuid)
    VALUES (UUID_TO_BIN(:uuid), UUID_TO_BIN(:parentuuid), UUID_TO_BIN(:useruuid));

INSERT INTO files(eyuuid, flname, flsize, flcontenttype, fldata)
    VALUES (UUID_TO_BIN(:uuid), :name, :size, :contenttype, :data);

INSERT INTO history(hruuid, eyuuid, uruuid, hrdatetime, hrtype)
    VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(:uuid), UUID_TO_BIN(:useruuid), NOW(), 'create');