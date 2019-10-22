
const path = require("path");
const fs = require("fs");

module.exports = {
    deleteentry: fs.readFileSync(path.join(__dirname, "./sql/deleteentry.sql"), "utf8"),
    deleteshare: fs.readFileSync(path.join(__dirname, "./sql/deleteshare.sql"), "utf8"),
    getaccesslevel: fs.readFileSync(path.join(__dirname, "./sql/getaccesslevel.sql"), "utf8"),
    getaccessleveldirect: fs.readFileSync(path.join(__dirname, "./sql/getaccessleveldirect.sql"), "utf8"),
    getbestentryshare: fs.readFileSync(path.join(__dirname, "./sql/getbestentryshare.sql"), "utf8"),
    getentryhistory: fs.readFileSync(path.join(__dirname, "./sql/getentryhistory.sql"), "utf8"),
    getentryinfo: fs.readFileSync(path.join(__dirname, "./sql/getentryinfo.sql"), "utf8"),
    getentryshares: fs.readFileSync(path.join(__dirname, "./sql/getentryshares.sql"), "utf8"),
    getentryusershare: fs.readFileSync(path.join(__dirname, "./sql/getentryusershare.sql"), "utf8"),
    getentryallshare: fs.readFileSync(path.join(__dirname, "./sql/getentryallshare.sql"), "utf8"),
    getfiledate: fs.readFileSync(path.join(__dirname, "./sql/getfiledata.sql"), "utf8"),
    getfoldercontent: fs.readFileSync(path.join(__dirname, "./sql/getfoldercontent.sql"), "utf8"),
    getfolderdata: fs.readFileSync(path.join(__dirname, "./sql/getfolderdata.sql"), "utf8"),
    getrootcontent: fs.readFileSync(path.join(__dirname, "./sql/getrootcontent.sql"), "utf8"),
    getuser: fs.readFileSync(path.join(__dirname, "./sql/getuser.sql"), "utf8"),
    getuserbyuuid: fs.readFileSync(path.join(__dirname, "./sql/getuserbyuuid.sql"), "utf8"),
    getuseravatar: fs.readFileSync(path.join(__dirname, "./sql/getuseravatar.sql"), "utf8"),
    getuserpasswdhash: fs.readFileSync(path.join(__dirname, "./sql/getuserpasswdhash.sql"), "utf8"),
    getuuid: fs.readFileSync(path.join(__dirname, "./sql/getuuid.sql"), "utf8"),
    insertentryshare: fs.readFileSync(path.join(__dirname, "./sql/insertentryshare.sql"), "utf8"),
    insertfileentry: fs.readFileSync(path.join(__dirname, "./sql/insertfileentry.sql"), "utf8"),
    insertfolderentry: fs.readFileSync(path.join(__dirname, "./sql/insertfolderentry.sql"), "utf8"),
    insertsharelinkentry: fs.readFileSync(path.join(__dirname, "./sql/insertsharelinkentry.sql"), "utf8"),
    updaterefilename: fs.readFileSync(path.join(__dirname, "./sql/updatefilename.sql"), "utf8"),
    updaterefoldername: fs.readFileSync(path.join(__dirname, "./sql/updatefoldername.sql"), "utf8"),
    updateshareaccesslevel: fs.readFileSync(path.join(__dirname, "./sql/updateshareaccesslevel.sql"), "utf8"),
    updateuseravatar: fs.readFileSync(path.join(__dirname, "./sql/updateuseravatar.sql"), "utf8"),
    updateuserpasswdhash: fs.readFileSync(path.join(__dirname, "./sql/updateuserpasswdhash.sql"), "utf8")
}
