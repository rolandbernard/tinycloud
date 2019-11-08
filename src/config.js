
const fs = require("fs");

module.exports = {
    ports: {
        http: 8080,
        https: 8443
    },
    db: {
        host: "localhost",
        user: "tiny",
        password: "tiny",
        database: "tinycloud"
    },
    saltrounds: 10,
    keys: {
        public: fs.readFileSync("/etc/ssl/localcerts/cert.pem"),
        private: fs.readFileSync("/etc/ssl/localcerts/cert.key")
    }
}
