SELECT ur.urpasswdhash AS hash, BIN_TO_UUID(ur.uruuid) AS uuid
    FROM users AS ur
    WHERE ur.uruname = :username;