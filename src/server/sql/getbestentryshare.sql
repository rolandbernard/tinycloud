SELECT BIN_TO_UUID(s.sid) uuid
	FROM shares s JOIN entrys e ON (s.sentryid = e.eid)
    WHERE s.sentryid = UUID_TO_BIN(:entryuuid)
      AND(s.usharewithid IS NULL
       OR s.usharewithid = UUID_TO_BIN(:useruuid))
    ORDER BY IF(s.stype = 'readwrite', 1, 0) DESC,
    		IF(s.usharewithid IS NOT NULL, 1, 0) DESC
    LIMIT 1;