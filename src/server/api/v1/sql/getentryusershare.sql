SELECT BIN_TO_UUID(sh.shuuid) AS uuid
    FROM shares AS sh
    WHERE sh.uruuid = UUID_TO_BIN(:useruuid)
      AND sh.eyuuid = UUID_TO_BIN(:entryuuid);
