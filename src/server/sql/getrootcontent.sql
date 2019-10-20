SELECT 	BIN_TO_UUID(e.eid) AS uuid,
		e.ename AS name,
        (e.etype = 'folder') AS isfolder,
        uow.uusername AS owner,
        hcr.hdatetime AS createdat,
        umd.uusername AS lastmodifieduser,
        hmd.hdatetime AS lastmodifiedat,
        f.fcontenttype AS contenttype,
        f.ffilesize AS filesize
	FROM entrys AS e
    	JOIN users AS uow ON (e.eownerid = uow.uid)
        LEFT JOIN history AS hcr
        	ON (hcr.hentryid = e.eid
            AND hcr.hdatetime = 
                (SELECT MIN(h.hdatetime)
                	FROM history AS h
                	WHERE h.hentryid = e.eid))
        LEFT JOIN history AS hmd
            ON (hmd.hentryid = e.eid
            AND hmd.hdatetime = 
                (SELECT MAX(h.hdatetime)
                	FROM history AS h
                	WHERE h.hentryid = e.eid))
        LEFT JOIN users AS umd ON (hmd.huserid = umd.uid)
        LEFT JOIN files AS f ON (f.fentryid = e.eid)
    WHERE e.eparentid IS NULL
      AND e.eownerid = UUID_TO_BIN(:useruuid)
UNION
SELECT  BIN_TO_UUID(sp.spid) AS uuid,
		e.ename AS name,
        (e.etype = 'folder') AS isfolder,
        uow.uusername AS owner,
        hcr.hdatetime AS createdat,
        umd.uusername AS lastmodifieduser,
        hmd.hdatetime AS lastmodifiedat,
        f.fcontenttype AS contenttype,
        f.ffilesize AS filesize
    FROM sharepoints sp
        JOIN shares s ON (s.sid = sp.spshareid)
        JOIN entrys e ON (e.eid = s.sentryid)
    	JOIN users AS uow ON (e.eownerid = uow.uid)
        LEFT JOIN history AS hcr
        	ON (hcr.hentryid = e.eid
            AND hcr.hdatetime = 
                (SELECT MIN(h.hdatetime)
                	FROM history AS h
                	WHERE h.hentryid = e.eid))
        LEFT JOIN history AS hmd
            ON (hmd.hentryid = e.eid
            AND hmd.hdatetime = 
                (SELECT MAX(h.hdatetime)
                	FROM history AS h
                	WHERE h.hentryid = e.eid))
        LEFT JOIN users AS umd ON (hmd.huserid = umd.uid)
        LEFT JOIN files AS f ON (f.fentryid = e.eid)
    WHERE sp.spparentid IS NULL
      AND sp.spmountedbyid = UUID_TO_BIN(:useruuid)
ORDER BY isfolder DESC, name ASC;