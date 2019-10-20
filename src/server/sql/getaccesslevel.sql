WITH RECURSIVE cte_entrys (eid, parentid, ownerid) AS (
    SELECT e.eid, e.eparentid, e.eownerid
    	FROM entrys AS e
    	WHERE e.eid = UUID_TO_BIN(:entryuuid)
    UNION 
    SELECT sp.spid, sp.spparentid, sp.spmountedbyid
        FROM sharepoints sp
        JOIN shares s ON (s.sid = sp.spshareid)
        JOIN entrys e ON (e.eid = s.sentryid)
    UNION
    SELECT e.eid, e.eparentid, e.eownerid
    	FROM entrys AS e, cte_entrys AS ce
    	WHERE ce.parentid = e.eid
)
SELECT MAX(IF(ce.ownerid = UUID_TO_BIN(:useruuid), 3, 
            IF(s.stype = 'readwritedelete', 3, 
            IF(s.stype = 'readwrite', 2, 
            IF(s.stype = 'readonly', 1, 0))))) AS accesslevel
    FROM cte_entrys AS ce
        LEFT JOIN shares AS s
            ON (s.sentryid = ce.eid
            AND(s.usharewithid IS NULL
             OR s.usharewithid = UUID_TO_BIN(:useruuid)));