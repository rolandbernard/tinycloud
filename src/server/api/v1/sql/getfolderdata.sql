WITH RECURSIVE resolved_entrys (oreyuuid, eyuuid, sheyuuid, eypath) AS (
    SELECT ey.eyuuid, ey.eyuuid, sh.eyuuid, IF(sh.eyuuid IS NULL, CONCAT('/', NVL(fl.flname, fd.fdname)), '')
        FROM entrys AS ey
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
            LEFT JOIN files AS fl ON (ey.eyuuid = fl.eyuuid)
            LEFT JOIN folders AS fd ON (ey.eyuuid = fd.eyuuid)
    	WHERE ey.eyparentuuid = UUID_TO_BIN(:entryuuid)
          AND(sh.uruuid = UUID_TO_BIN(:useruuid) OR sh.uruuid IS NULL)
    UNION
    SELECT re.oreyuuid, ey.eyuuid, sh.eyuuid, IF(sh.eyuuid IS NULL, CONCAT(re.eypath, '/', NVL(fl.flname, fd.fdname)), re.eypath)
        FROM entrys AS ey
            JOIN resolved_entrys AS re
                ON (ey.eyuuid = re.sheyuuid
                OR (re.sheyuuid IS NULL
                AND ey.eyparentuuid = re.eyuuid
                ))
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
            LEFT JOIN files AS fl ON (ey.eyuuid = fl.eyuuid)
            LEFT JOIN folders AS fd ON (ey.eyuuid = fd.eyuuid)
        WHERE re.oreyuuid != ey.eyuuid
)
SELECT  re.eypath AS filepath,
        fl.fldata AS filedata
    FROM entrys AS ey
        JOIN resolved_entrys AS re ON (ey.eyuuid = re.eyuuid)
        JOIN files AS fl ON (ey.eyuuid = fl.eyuuid)
    WHERE re.sheyuuid IS NULL;