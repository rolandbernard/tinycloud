SELECT  h.hdatetime AS datetime,
        u.uusername AS user,
        h.hoperation AS operation
	FROM history AS h
    	JOIN users AS u ON (u.uid = h.huserid)
    WHERE h.hentryid = UUID_TO_BIN(:entryuuid)
UNION
SELECT  h.hdatetime AS datetime,
        u.uusername AS user,
        h.hoperation AS operation
	FROM sharepoints sp
        JOIN shares AS s ON (sp.spshareid = s.sid)
        JOIN history AS h ON (s.sentryid = h.hentryid)
    	JOIN users AS u ON (u.uid = h.huserid)
    WHERE sp.spid = UUID_TO_BIN(:entryuuid)
ORDER BY datetime DESC;