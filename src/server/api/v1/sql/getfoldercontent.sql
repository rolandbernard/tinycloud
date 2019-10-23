WITH RECURSIVE resolved_entrys (oreyuuid, eyuuid, sheyuuid) AS (
    SELECT ey.eyuuid, ey.eyuuid, sh.eyuuid
        FROM entrys AS ey
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
    	WHERE ey.eyparentuuid = UUID_TO_BIN(:parentuuid)
    UNION
    SELECT re.oreyuuid, ey.eyuuid, sh.eyuuid
        FROM entrys AS ey
            JOIN resolved_entrys AS re ON (ey.eyuuid = re.sheyuuid)
            LEFT JOIN sharelinks AS sl ON (ey.eyuuid = sl.eyuuid)
            LEFT JOIN shares AS sh ON (sl.shuuid = sh.shuuid)
)
SELECT 	BIN_TO_UUID(re.oreyuuid) AS uuid,
		NVL(fd.fdname, fl.flname) AS name,
        (fd.eyuuid IS NOT NULL) AS isfolder,
        owur.uruname AS owner,
        crhr.hrdatetime AS createdat,
        lmur.uruname AS lastmodifieduser,
        lmhr.hrdatetime AS lastmodifiedat,
        fl.flcontenttype AS contenttype,
        fl.flsize AS filesize
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
    WHERE re.sheyuuid IS NULL;