SELECT  h.hdatetime AS datetime,
        u.uusername AS user,
        h.hoperation AS operation
	FROM history AS h
    	JOIN users AS u ON (u.uid = h.huserid)
    WHERE h.hentryid = UUID_TO_BIN(:entryuuid);