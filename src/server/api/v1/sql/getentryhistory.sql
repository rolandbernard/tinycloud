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
SELECT  NVL(ur.uruname, 'guest') AS user,
        hr.hrdatetime AS datetime,
        hr.hrtype AS action
    FROM entrys AS ey
        JOIN resolved_entrys AS re ON (ey.eyuuid = re.eyuuid)
        LEFT JOIN history AS hr ON (hr.eyuuid = ey.eyuuid)
        LEFT JOIN users AS ur ON (ur.uruuid = hr.uruuid)
    WHERE re.sheyuuid IS NULL
    ORDER BY hr.hrdatetime DESC;
