WITH RECURSIVE resolved_parrent_entrys (oreyuuid, eyuuid, sheyuuid, eyparentuuid) AS (
    SELECT ey.eyuuid, ey.eyuuid, sh.eyuuid, ey.eyparentuuid
        FROM entrys AS ey
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
        WHERE ey.eyuuid = UUID_TO_BIN(:entryuuid)
    UNION
    SELECT re.oreyuuid, ey.eyuuid, sh.eyuuid, ey.eyparentuuid
        FROM entrys AS ey
            JOIN resolved_parrent_entrys AS re
                ON (ey.eyuuid = re.sheyuuid
                OR (ey.eyuuid = re.eyparentuuid
                AND re.sheyuuid IS NULL))
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
)
SELECT CONCAT(
        IF(MAX(IF(sh.shaccesslevel LIKE '%r%' OR ey.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'r', ''),
        IF(MAX(IF(sh.shaccesslevel LIKE '%w%' OR ey.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'w', ''),
        IF(MAX(IF(sh.shaccesslevel LIKE '%d%' OR ey.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'd', '')
       ) AS accesslevel
    FROM entrys AS ey
        JOIN resolved_parrent_entrys AS re ON (ey.eyuuid = re.eyuuid)
        LEFT JOIN shares AS sh ON (ey.eyuuid = sh.eyuuid)
    WHERE re.sheyuuid IS NULL;