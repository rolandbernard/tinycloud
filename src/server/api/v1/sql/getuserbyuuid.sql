SELECT BIN_TO_UUID(ur.uruuid) AS uuid
    FROM users AS ur
    WHERE ur.uruuid = UUID_TO_BIN(:useruuid);