WITH RECURSIVE resolved_parrent_entrys (eyuuid, eyparentuuid) AS (
    SELECT ey.eyuuid ey.eyparentuuid
        FROM entrys AS ey
        WHERE ey.eyuuid = UUID_TO_BIN(:entryuuid)
    UNION
    SELECT ey.eyuuid, ey.eyparentuuid
        FROM entrys AS ey
            JOIN resolved_parrent_entrys AS re
                ON (ey.eyuuid = re.eyparentuuid)
)
SELECT CONCAT(
        IF(MAX(IF(sh.shaccesslevel LIKE '%r%' OR ey.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'r', ''),
        IF(MAX(IF(sh.shaccesslevel LIKE '%w%' OR ey.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'w', ''),
        IF(MAX(IF(sh.shaccesslevel LIKE '%d%' OR ey.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'd', '')
       ) AS accesslevel
    FROM entrys AS ey
        JOIN resolved_parrent_entrys AS re ON (ey.eyuuid = re.eyuuid)
        LEFT JOIN shares AS sh
            ON (ey.eyuuid = sh.eyuuid
            AND(sh.uruuid = UUID_TO_BIN(:useruuid)
             OR sh.uruuid IS NULL))
    WHERE re.sheyuuid IS NULL;