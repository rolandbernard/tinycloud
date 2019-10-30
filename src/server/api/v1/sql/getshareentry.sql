SELECT BIN_TO_UUID(sh.eyuuid) AS uuid
    FROM shares AS sh
    WHERE sh.shuuid = UUID_TO_BIN(:shareuuid);