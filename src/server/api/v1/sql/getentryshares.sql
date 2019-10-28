WITH RECURSIVE resolved_entrys (oreyuuid, eyuuid, sheyuuid) AS (
    SELECT ey.eyuuid, ey.eyuuid, sh.eyuuid
        FROM entrys AS ey
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
    	WHERE ey.eyuuid = UUID_TO_BIN(:entryuuid)
          AND(sh.uruuid = UUID_TO_BIN(:useruuid) OR sh.uruuid IS NULL)
    UNION
    SELECT re.oreyuuid, ey.eyuuid, sh.eyuuid
        FROM entrys AS ey
            JOIN resolved_entrys AS re ON (ey.eyuuid = re.sheyuuid)
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
)
SELECT  BIN_TO_UUID(sh.shuuid) AS uuid,
        NVL(ur.uruname, 'all') AS user,
        sh.shaccesslevel AS accesslevel
    FROM entrys AS ey
        JOIN resolved_entrys AS re ON (ey.eyuuid = re.eyuuid)
        LEFT JOIN shares AS sh ON (sh.eyuuid = ey.eyuuid)
        LEFT JOIN users AS ur ON (ur.uruuid = sh.uruuid)
    WHERE re.sheyuuid IS NULL;