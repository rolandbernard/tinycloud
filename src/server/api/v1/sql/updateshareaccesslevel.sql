UPDATE shares AS sh
    SET sh.shaccesslevel = :accesslevel
    WHERE sh.shuuid = UUID_TO_BIN(:shareuuid);