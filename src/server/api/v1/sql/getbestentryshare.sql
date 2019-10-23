SELECT sh.shuuid AS uuid, sh.shaccesslevel AS accesslevel
    FROM entrys AS ey
        JOIN shares AS sh ON (ey.eyuuid = sh.eyuuid)
    WHERE ey.eyuuid = UUID_TO_BIN(:entryuuid)
      AND(sh.uruuid IS NULL
       OR sh.uruuid = UUID_TO_BIN(:useruuid))
    ORDER BY IF(sh.shaccesslevel LIKE '%d%', 3, IF(sh.shaccesslevel LIKE '%w%', 2, IF(sh.shaccesslevel LIKE '%r%', 1, 0))) DESC,
        IF(sh.uruuid IS NOT NULL, 1, 0) DESC
    LIMIT 1;
    