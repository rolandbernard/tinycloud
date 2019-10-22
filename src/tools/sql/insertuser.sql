INSERT INTO users(uruuid, uruname, urpasswdhash, uravatar)
    VALUES (UUID_TO_BIN(UUID()), :username, :passwordhash, :avatar);