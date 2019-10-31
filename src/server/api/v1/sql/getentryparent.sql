WITH RECURSIVE resolved_parrent_entrys (oreyuuid, eyuuid, eyparentuuid) AS (
    SELECT ey.eyuuid, ey.eyuuid, ey.eyparentuuid
        FROM entrys AS ey
        WHERE ey.eyuuid = UUID_TO_BIN(:entryuuid)
    UNION
    SELECT re.oreyuuid, ey.eyuuid, ey.eyparentuuid
        FROM entrys AS ey
            JOIN resolved_parrent_entrys AS re
                ON (ey.eyuuid = re.eyparentuuid)
)
SELECT ey.eyuuid
    FROM entrys AS ey
        JOIN resolved_parrent_entrys AS re ON (ey.eyuuid = re.eyuuid)
    WHERE ey.eyuuid = UUID_TO_BIN(:parentuuid);