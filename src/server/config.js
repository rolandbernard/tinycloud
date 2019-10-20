
const fs = require("fs");

module.exports = {
    ports: {
        http: 8080,
        https: 8443
    },
    db: {
        host: "localhost",
        user: "root",
        password: "root",
        database: "tinycloud"
    },
    saltrounds: 10,
    keys: {
        public: fs.readFileSync("/etc/ssl/localcerts/cert.pem"),
        private: fs.readFileSync("/etc/ssl/localcerts/cert.key")
    }
}
