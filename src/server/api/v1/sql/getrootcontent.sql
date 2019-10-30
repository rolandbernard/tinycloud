WITH RECURSIVE resolved_entrys (oreyuuid, eyuuid, sheyuuid) AS (
    SELECT ey.eyuuid, ey.eyuuid, sh.eyuuid
        FROM entrys AS ey
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
    	WHERE ey.eyparentuuid IS NULL
          AND(sh.uruuid = UUID_TO_BIN(:useruuid) OR sh.uruuid IS NULL)
          AND ey.uruuid = UUID_TO_BIN(:useruuid)
    UNION
    SELECT re.oreyuuid, ey.eyuuid, sh.eyuuid
        FROM entrys AS ey
            JOIN resolved_entrys AS re ON (ey.eyuuid = re.sheyuuid)
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
), resolved_parrent_entrys (oreyuuid, eyuuid, sheyuuid, eyparentuuid) AS (
    SELECT ey.eyuuid, ey.eyuuid, sh.eyuuid, ey.eyparentuuid
        FROM entrys AS ey
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
        WHERE ey.eyparentuuid IS NULL
          AND(sh.uruuid = UUID_TO_BIN(:useruuid) OR sh.uruuid IS NULL)
          AND ey.uruuid = UUID_TO_BIN(:useruuid)
    UNION
    SELECT re.oreyuuid, ey.eyuuid, sh.eyuuid, ey.eyparentuuid
        FROM entrys AS ey
            JOIN resolved_parrent_entrys AS re
                ON (ey.eyuuid = re.sheyuuid
                OR (ey.eyuuid = re.eyparentuuid
                AND re.sheyuuid IS NULL))
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
), resolved_parrent_entrys_direct (oreyuuid, eyuuid, eyparentuuid) AS (
    SELECT ey.eyuuid, ey.eyuuid, ey.eyparentuuid
        FROM entrys AS ey
        WHERE ey.eyuuid = UUID_TO_BIN(:entryuuid)
    UNION
    SELECT re.oreyuuid, ey.eyuuid, ey.eyparentuuid
        FROM entrys AS ey
            JOIN resolved_parrent_entrys_direct AS re ON (ey.eyuuid = re.eyparentuuid)
)
SELECT 	BIN_TO_UUID(ey.eyuuid) AS uuid,
		NVL(fd.fdname, fl.flname) AS name,
        (fd.eyuuid IS NOT NULL) AS isfolder,
        NVL(owur.uruname, 'guest') AS owner,
        crhr.hrdatetime AS createddatetime,
        NVL(lmur.uruname, 'guest') AS lastmodifieduser,
        lmhr.hrdatetime AS lastmodifieddatetime,
        fl.flcontenttype AS contenttype,
        fl.flsize AS filesize,
        (SELECT CONCAT(
                    IF(MAX(IF(sh.shaccesslevel LIKE '%r%' OR eya.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'r', ''),
                    IF(MAX(IF(sh.shaccesslevel LIKE '%w%' OR eya.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'w', ''),
                    IF(MAX(IF(sh.shaccesslevel LIKE '%d%' OR eya.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'd', '')
                )
            FROM entrys AS eya
                JOIN resolved_parrent_entrys AS rea ON (eya.eyuuid = rea.eyuuid)
                LEFT JOIN shares AS sh
                    ON (eya.eyuuid = sh.eyuuid
                    AND(sh.uruuid = UUID_TO_BIN(:useruuid)
                    OR sh.uruuid IS NULL))
            WHERE rea.sheyuuid IS NULL
              AND re.oreyuuid = rea.oreyuuid) AS accesslevel,
        (re.oreyuuid != re.eyuuid) AS isshare,
        BIN_TO_UUID(re.oreyuuid) AS shareuuid,
        (SELECT CONCAT(
                    IF(MAX(IF(sh.shaccesslevel LIKE '%r%' OR eya.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'r', ''),
                    IF(MAX(IF(sh.shaccesslevel LIKE '%w%' OR eya.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'w', ''),
                    IF(MAX(IF(sh.shaccesslevel LIKE '%d%' OR eya.uruuid = UUID_TO_BIN(:useruuid), 1, 0)) = 1, 'd', '')
                )
            FROM entrys AS eya
                JOIN resolved_parrent_entrys_direct AS rea ON (eya.eyuuid = rea.eyuuid)
                LEFT JOIN shares AS sh
                    ON (eya.eyuuid = sh.eyuuid
                    AND(sh.uruuid = UUID_TO_BIN(:useruuid)
                    OR sh.uruuid IS NULL))
              WHERE re.oreyuuid = rea.oreyuuid) AS directaccesslevel
    FROM entrys AS ey
        JOIN resolved_entrys AS re ON (ey.eyuuid = re.eyuuid)
        LEFT JOIN files AS fl ON (ey.eyuuid = fl.eyuuid)
        LEFT JOIN folders AS fd ON (ey.eyuuid = fd.eyuuid)
        JOIN users AS owur ON (ey.uruuid = owur.uruuid)
        LEFT JOIN history AS crhr
        	ON (crhr.eyuuid = ey.eyuuid
            AND crhr.hrdatetime = 
                (SELECT MIN(hr.hrdatetime)
                	FROM history AS hr
                	WHERE hr.eyuuid = ey.eyuuid))
        LEFT JOIN history AS lmhr
            ON (lmhr.eyuuid = ey.eyuuid
            AND lmhr.hrdatetime = 
                (SELECT MAX(hr.hrdatetime)
                	FROM history AS hr
                	WHERE hr.eyuuid = ey.eyuuid))
        LEFT JOIN users AS lmur ON (lmhr.uruuid = lmur.uruuid)
    WHERE re.sheyuuid IS NULL
    ORDER BY isfolder DESC, name ASC;