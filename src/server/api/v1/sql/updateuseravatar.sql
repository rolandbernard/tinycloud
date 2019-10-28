UPDATE users AS ur
    SET ur.uravatar = :avatar
    WHERE ur.uruuid = UUID_TO_BIN(:useruuid);