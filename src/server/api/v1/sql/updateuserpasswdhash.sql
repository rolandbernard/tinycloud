UPDATE users AS ur
    SET ur.urpasswdhash = :passwordhash
    WHERE ur.uruuid = UUID_TO_BIN(:useruuid);