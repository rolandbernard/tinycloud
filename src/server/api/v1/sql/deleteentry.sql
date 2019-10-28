DELETE ey
    FROM entrys AS ey
    WHERE ey.eyuuid = UUID_TO_BIN(:entryuuid);