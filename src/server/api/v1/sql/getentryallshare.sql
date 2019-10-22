SELECT BIN_TO_UUID(sh.shuuid) AS uuid
    FROM shares AS sh
    WHERE sh.uruuid IS NULL
      AND sh.eyuuid = UUID_TO_BIN(:entryuuid);