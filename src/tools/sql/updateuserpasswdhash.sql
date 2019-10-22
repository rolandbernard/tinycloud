UPDATE users AS ur
    SET ur.urpasswdhash = :passwordhash
    WHERE ur.uruname = :username;