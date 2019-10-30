DELETE ey
    FROM entrys AS ey
        JOIN sharelinks AS sl ON (sl.eyuuid = ey.eyuuid)
    WHERE sl.shuuid = UUID_TO_BIN(:shareuuid);

DELETE sh
    FROM shares AS sh
    WHERE sh.shuuid = UUID_TO_BIN(:shareuuid);
