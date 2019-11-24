DELETE ey
    FROM entrys AS ey
        JOIN sharelinks AS sl ON (sl.eyuuid = ey.eyuuid)
        JOIN shares AS sh ON (sh.shuuid = sl.shuuid)
    WHERE sh.eyuuid = UUID_TO_BIN(:entryuuid);

DELETE sh
    FROM shares AS sh
    WHERE sh.eyuuid = UUID_TO_BIN(:entryuuid);

DELETE ey
    FROM entrys AS ey
    WHERE ey.eyuuid = UUID_TO_BIN(:entryuuid);
