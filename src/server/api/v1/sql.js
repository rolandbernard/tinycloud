
const path = require("path");
const fs = require("fs");

module.exports = {
    deleteentry: fs.readFileSync(path.join(__dirname, "./sql/deleteentry.sql")),
    deleteshare: fs.readFileSync(path.join(__dirname, "./sql/deleteshare.sql")),
    getaccesslevel: fs.readFileSync(path.join(__dirname, "./sql/getaccesslevel.sql")),
    getbestentryshare: fs.readFileSync(path.join(__dirname, "./sql/getbestentryshare.sql")),
    getentryhistory: fs.readFileSync(path.join(__dirname, "./sql/getentryhistory.sql")),
    getentryinfo: fs.readFileSync(path.join(__dirname, "./sql/getentryinfo.sql")),
    getentryshares: fs.readFileSync(path.join(__dirname, "./sql/getentryshares.sql")),
    getentryusershare: fs.readFileSync(path.join(__dirname, "./sql/getentryusershare.sql")),
    getfiledate: fs.readFileSync(path.join(__dirname, "./sql/getfiledata.sql")),
    getfoldercontent: fs.readFileSync(path.join(__dirname, "./sql/getfoldercontent.sql")),
    getfolderdata: fs.readFileSync(path.join(__dirname, "./sql/getfolderdata.sql")),
    getrootcontent: fs.readFileSync(path.join(__dirname, "./sql/getrootcontent.sql")),
    getuser: fs.readFileSync(path.join(__dirname, "./sql/getuser.sql")),
    getuseravatar: fs.readFileSync(path.join(__dirname, "./sql/getuseravatar.sql")),
    getuserpasswdhash: fs.readFileSync(path.join(__dirname, "./sql/getuserpasswdhash.sql")),
    getuuid: fs.readFileSync(path.join(__dirname, "./sql/getuuid.sql")),
    insertentryshare: fs.readFileSync(path.join(__dirname, "./sql/insertentryshare.sql")),
    insertfileentry: fs.readFileSync(path.join(__dirname, "./sql/insertfileentry.sql")),
    insertfolderentry: fs.readFileSync(path.join(__dirname, "./sql/insertfolderentry.sql")),
    insertsharelinkentry: fs.readFileSync(path.join(__dirname, "./sql/insertsharelinkentry.sql")),
    updaterenameentry: fs.readFileSync(path.join(__dirname, "./sql/updaterenameentry.sql")),
    updateshareaccesslevel: fs.readFileSync(path.join(__dirname, "./sql/updateshareaccesslevel.sql")),
    updateuseravatar: fs.readFileSync(path.join(__dirname, "./sql/updateuseravatar.sql")),
    updateuserpasswdhash: fs.readFileSync(path.join(__dirname, "./sql/updateuserpasswdhash.sql"))
}
