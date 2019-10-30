SELECT ur.uravatar AS avatar
    FROM users AS ur
    WHERE ur.uruname = :username;