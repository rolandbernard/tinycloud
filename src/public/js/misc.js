
let current_path = [];

function change_path(path) {
    current_path = path;
    set_displayed_path(path);
    generate_root_directory_content(get_drive_data(path.length > 0 ? path[path.length - 1].uuid : null), path);
}

function get_current_path() {
    return current_path;
}

function user_login(username) {
    const explorer = document.getElementById("explorer"); 
    const login = document.getElementById("login");
    const newbutton = document.getElementById("new");
    explorer.style.display = "flex";
    newbutton.style.display = "block";
    login.style.display = "none";
    delete_all_childs(infotexterror);
    const user = document.getElementById("user");
    const node = document.createElement("img");
    delete_all_childs(user);
    node.id = "useravatar";
    node.src = "/api/v1/user/" + encodeURI(username) + "/avatar";
    user.appendChild(node);
    const path_json = (new URL(window.location.href)).searchParams.get("path");
    if (path_json) {
        change_path(JSON.parse(path_json));
    } else {
        change_path([]);
    }
    setInterval(async function () {
        if(!await attemt_extention()) {
            user_logout();
        }
    }, 3600000);
}

function user_logout() {
    const explorer = document.getElementById("explorer"); 
    const login = document.getElementById("login");
    const newbutton = document.getElementById("new");
    explorer.style.display = "none";
    newbutton.style.display = "none";
    login.style.display = "block";
    delete_all_childs(infotexterror);
    const user = document.getElementById("user");
    delete_all_childs(user);
    const root = document.getElementById("rootdirectory");
    delete_all_childs(root);
    const pathdiv = document.getElementById("path");
    delete_all_childs(pathdiv);
    delete_credentials();
}

let uploading_count = 0;

function upload_start() {
    uploading_count++;
    const uploadloading = document.getElementById("uploadloading");
    delete_all_childs(uploadloading);
    uploadloading.appendChild(generate_loader());
    uploadloading.style.display = "block";
}

function upload_end() {
    uploading_count--;
    if(uploading_count === 0) {
        uploadloading.style.display = "none";
        delete_all_childs(uploadloading);
    }
}

async function upload_files_input(uuid_or_null, files) {
    upload_start();
    await Promise.all(files.map(function (file) {
        return upload_file(uuid_or_null, file);
    }));
    await update_root_view_content();
    upload_end();
}

async function update_file_input(uuid_or_null, file) {
    upload_start();
    await update_file(uuid_or_null, file);
    await update_root_view_content();
    upload_end();
}

async function upload_recursively(uuid_or_null, entry) {
    if (entry.isFile) {
        await upload_file(uuid_or_null, await new Promise(function (resolve) {
            entry.file(function (file) {
                resolve(file);
            });
        }));
    } else if (entry.isDirectory) {
        await new Promise(function (resolve) {
            entry.createReader().readEntries(async function (child_entrys) {
                const uuid = await new_folder(uuid_or_null, entry.name);
                if (uuid) {
                    await Promise.all(child_entrys.map(function (child_entry) {
                        return upload_recursively(uuid.uuid, child_entry);
                    }));
                }
                resolve();
            });
        });
    }
}

async function upload_files_folders_drop(uuid_or_null, files) {
    upload_start();
    await Promise.all(files.map(function (file) {
        if (file.webkitGetAsEntry) {
            return upload_recursively(uuid_or_null, file.webkitGetAsEntry());
        } else {
            return upload_file(uuid_or_null, file.getAsFile());
        }
    }));
    await update_root_view_content();
    upload_end();
}

async function upload_change_avatar(file) {
    upload_start();
    await change_avatar(file);
    const useravatar = document.getElementById("useravatar");
    const username = get_username();
    useravatar.src = "/api/v1/user/" + encodeURI(username) + "/avatar?time=" + Date.now();
    upload_end();
}

window.addEventListener("popstate", function (event) {
    if (event.state && event.state.path) {
        change_path(event.state.path);
    } else {
        change_path([]);
    }
});

window.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

window.addEventListener("load", async function () {
    const page = document.getElementById("page");
    const loginform = document.getElementById("loginform");
    const usernameinput = document.getElementById("username");
    const passwordinput = document.getElementById("password");
    const loginsubmit = document.getElementById("signin");
    const rememberme = document.getElementById("rememberme");
    const infotexterror = document.getElementById("infotexterror");
    loginform.addEventListener("submit", async function (event) {
        event.preventDefault();
        usernameinput.disabled = true;
        passwordinput.disabled = true;
        loginsubmit.disabled = true;
        rememberme.disabled = true;
        delete_all_childs(infotexterror);
        infotexterror.appendChild(generate_loader());
        const username = usernameinput.value;
        const password = passwordinput.value;
        if (username === "") {
            delete_all_childs(infotexterror);
            infotexterror.appendChild(document.createTextNode("Enter a username"));
        } else {
            const success = await attemt_login(username, password, rememberme.checked);
            if (success) {
                user_login(username);
            } else {
                delete_all_childs(infotexterror);
                infotexterror.appendChild(document.createTextNode("Wrong username or password"));
            }
        }
        usernameinput.disabled = false;
        passwordinput.disabled = false;
        loginsubmit.disabled = false;
        rememberme.disabled = false;
    });

    const newbutton = document.getElementById("new");
    const newmenu = document.getElementById("newmenu");
    newbutton.addEventListener("click", function (event) {
        event.just_opened_new = true;
        newmenu.style.display = "flex";
        function handl(event) {
            if (event.just_opened_new === undefined) {
                newmenu.style.display = "none";
                window.removeEventListener("click", handl);
                window.removeEventListener("contextmenu", handl);
                window.removeEventListener("dblclick", handl);
            }
        }
        window.addEventListener("click", handl);
        window.addEventListener("contextmenu", handl);
        window.addEventListener("dblclick", handl);
    });

    const foldernew = document.getElementById("foldernew");
    const newfolder = document.getElementById("newfolder");
    newfolder.addEventListener("click", function () {
        foldernew.style.display = "block";
        // page.style.filter = "blur(1px)";
        page.style.pointerEvents = "none";
    });

    const fileupload = document.getElementById("fileupload");
    const uploadfile = document.getElementById("uploadfile");
    uploadfile.addEventListener("click", function () {
        fileupload.style.display = "block";
        // page.style.filter = "blur(1px)";
        page.style.pointerEvents = "none";
    });

    const userbutton = this.document.getElementById("user");
    const usermenu = document.getElementById("usermenu");
    userbutton.addEventListener("click", function (event) {
        event.just_opened_user = true;
        usermenu.style.display = "flex";
        function handl(event) {
            if (event.just_opened_user === undefined) {
                usermenu.style.display = "none";
                window.removeEventListener("click", handl);
                window.removeEventListener("contextmenu", handl);
                window.removeEventListener("dblclick", handl);
            }
        }
        window.addEventListener("click", handl);
        window.addEventListener("contextmenu", handl);
        window.addEventListener("dblclick", handl);
    });

    const passwordchange = document.getElementById("passwordchange")
    const passwordchangeclose = document.getElementById("passwordchangeclose");
    const passwordchangeinput = document.getElementById("newpassword");
    const passwordchangeinputrepeat = document.getElementById("newpasswordrepeat");
    const passwordchangeerror = document.getElementById("passwordchangeerror");
    passwordchangeclose.addEventListener("click", function () {
        passwordchange.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
        passwordchangeinput.value = "";
        passwordchangeinputrepeat.value = "";
        delete_all_childs(passwordchangeerror);
    });

    const passwordchangeform = document.getElementById("passwordchangeform");
    const passwordchangesubmit =  document.getElementById("passwordchangesubmit");
    passwordchangeform.addEventListener("submit", async function f() {
        event.preventDefault();
        passwordchangeinput.disabled = true;
        passwordchangeinputrepeat.disabled = true;
        passwordchangesubmit.disabled = true;
        const new_password = passwordchangeinput.value;
        const new_password_repeat = passwordchangeinputrepeat.value;
        delete_all_childs(passwordchangeerror);
        if (new_password === "" || new_password_repeat === "") {
            passwordchangeerror.appendChild(document.createTextNode("Enter a new password"));
        } else {
            if (new_password !== new_password_repeat){
                passwordchangeerror.appendChild(document.createTextNode("The two passwords have to match"));
            } else {
                await change_password(new_password);
                passwordchange.style.display = "none";
                // page.style.filter = "none";
                page.style.pointerEvents = "all";
                passwordchangeinput.value = "";
                passwordchangeinputrepeat.value = "";
            }
        }
        passwordchangeinput.disabled = false;
        passwordchangeinputrepeat.disabled = false;
        passwordchangesubmit.disabled = false;
    });

    const avatarchange = document.getElementById("avatarchange");
    const avatarchangeinput = document.getElementById("avatarchangein");
    const avatarchangeerror = document.getElementById("avatarchangeerror");
    const avatar_supported_types = {
        "image/png":true,
        "image/jpeg":true,
        "image/gif":true,
        "image/svg+xml":true,
        "image/tiff":true,
        "image/x-tiff":true,
        "image/webp":true,
    };
    avatarchangeinput.addEventListener("change", function () {
        const file = avatarchangeinput.files[0];
        delete_all_childs(avatarchangeerror);
        if (avatar_supported_types[file.type]) {
            upload_change_avatar(avatarchangeinput.files[0]);
            avatarchange.style.display = "none";
            // page.style.filter = "none";
            page.style.pointerEvents = "all";
        } else {
            avatarchangeerror.appendChild(document.createTextNode("The file must be an image"));
        }
    });

    const avatarchangeclose = document.getElementById("avatarchangeclose");
    avatarchangeclose.addEventListener("click", function () {
        avatarchange.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
    });

    const changeavatar = document.getElementById("changeavatar");
    changeavatar.addEventListener("click", function () {
        avatarchange.style.display = "block";
        // page.style.filter = "blur(0.5px)";
        page.style.pointerEvents = "none";
    });

    const changepassword = document.getElementById("changepassword");
    changepassword.addEventListener("click", function () {
        passwordchange.style.display = "block";
        // page.style.filter = "blur(1px)";
        page.style.pointerEvents = "none";
    });

    const logout = document.getElementById("logout");
    logout.addEventListener("click", function () {
        user_logout();
    });

    const fileuploadbox = document.getElementById("fileuploadbox");
    let upload_enter_exit = 0;
    fileuploadbox.addEventListener("dragenter", function (event) {
        event.preventDefault();
        if (upload_enter_exit === 0) {
            fileuploadbox.classList.add("fileuploaddrag");
        }
        upload_enter_exit++;
    });
    fileuploadbox.addEventListener("dragleave", function () {
        upload_enter_exit--;
        if (upload_enter_exit === 0) {
            fileuploadbox.classList.remove("fileuploaddrag");
        }
    });
    fileuploadbox.addEventListener("dragover", function (event) {
        event.preventDefault();
    });
    fileuploadbox.addEventListener("drop", function (event) {
        event.preventDefault();
        const entry = get_active_entry();
        const path = get_current_path();
        const uuid = (entry !== null ? (entry.path.length > 1 ? entry.path[entry.path.length - 1].uuid : null) : (path.length > 1 ? path[path.length - 1].uuid : null));
        upload_files_folders_drop(uuid, Array.from(event.dataTransfer.items).filter(function (el) {
            return el.kind === "file";
        }));
        upload_enter_exit = 0;
        fileuploadbox.classList.remove("fileuploaddrag");
        fileupload.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
    });

    const fileuploadinput = document.getElementById("fileuploadin");
    fileuploadinput.addEventListener("change", function () {
        const entry = get_active_entry();
        const path = get_current_path();
        const uuid = (entry !== null ? (entry.path.length > 1 ? entry.path[entry.path.length - 2].uuid : null) : (path.length > 0 ? path[path.length - 1].uuid : null));
        upload_files_input(uuid, Array.from(fileuploadinput.files));
        fileupload.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
    });

    const fileuploadclose = document.getElementById("fileuploadclose");
    fileuploadclose.addEventListener("click", function () {
        fileupload.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
    });

    const fileupdate = document.getElementById("fileupdate");
    const fileupdatebox = document.getElementById("fileupdatebox");
    let update_enter_exit = 0;
    fileupdatebox.addEventListener("dragenter", function (event) {
        event.preventDefault();
        if (update_enter_exit === 0) {
            fileupdatebox.classList.add("fileuploaddrag");
        }
        update_enter_exit++;
    });
    fileupdatebox.addEventListener("dragleave", function () {
        update_enter_exit--;
        if (update_enter_exit === 0) {
            fileupdatebox.classList.remove("fileuploaddrag");
        }
    });
    fileupdatebox.addEventListener("dragover", function (event) {
        event.preventDefault();
    });
    fileupdatebox.addEventListener("drop", function (event) {
        event.preventDefault();
        const entry = get_active_entry();
        update_file_input(entry.uuid, Array.from(event.dataTransfer.items).filter(function (el) {
            return el.kind === "file";
        })[0].getAsFile());
        update_enter_exit = 0;
        fileupdatebox.classList.remove("fileuploaddrag");
        fileupdate.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
    });

    const fileupdateinput = document.getElementById("fileupdatein");
    fileupdateinput.addEventListener("change", function () {
        const entry = get_active_entry();
        update_file_input(entry.uuid, fileupdateinput.files[0]);
        fileupdate.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
    });

    const fileupdateclose = document.getElementById("fileupdateclose");
    fileupdateclose.addEventListener("click", function () {
        fileupdate.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
    });

    const foldernewerror = document.getElementById("foldernewerror");
    const foldernewclose = document.getElementById("foldernewclose");
    const foldernewinput = document.getElementById("foldername");
    foldernewclose.addEventListener("click", function () {
        foldernew.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
        foldernewinput.value = "";
        delete_all_childs(foldernewerror);
    });

    const foldernewform = document.getElementById("foldernewform");
    const foldernewsubmit = document.getElementById("foldernewsubmit");
    foldernewform.addEventListener("submit", async function (event) {
        event.preventDefault();
        foldernewinput.disabled = true;
        foldernewsubmit.disabled = true;
        const newfoldername = foldernewinput.value;
        delete_all_childs(foldernewerror);
        if (newfoldername === ""){
            foldernewerror.appendChild(document.createTextNode("Enter a foldername"));
        }else{
            const entry = get_active_entry();
            const path = get_current_path();
            const uuid = (entry !== null ? (entry.path.length > 1 ? entry.path[entry.path.length - 2].uuid : null) : (path.length > 0 ? path[path.length - 1].uuid : null));
            await new_folder(uuid, newfoldername);
            update_root_view_content();
            foldernew.style.display = "none";
            // page.style.filter = "none";
            page.style.pointerEvents = "all";
            foldernewinput.value = "";
        }
        foldernewinput.disabled = false;
        foldernewsubmit.disabled = false;
    });

    const renameentry = document.getElementById("renameentry");
    const renameentryerror = document.getElementById("renameentryerror");
    const renameentryclose = document.getElementById("renameentryclose");
    renameentryclose.addEventListener("click", function () {
        renameentry.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
        delete_all_childs(renameentryerror);
    });

    const renameentryform = document.getElementById("renameentryform");
    const renameentryinput = document.getElementById("renameentrynewname");
    const renameentrysubmit = document.getElementById("renameentrysubmit");
    renameentryform.addEventListener("submit", async function (event) {
        event.preventDefault();
        renameentryinput.disabled = true;
        renameentrysubmit.disabled = true;
        const newname = renameentryinput.value;
        delete_all_childs(renameentryerror);
        if (newname === ""){
            renameentryerror.appendChild(document.createTextNode("Enter a name"));
        } else {
            const entry = get_active_entry();
            if (entry.data.name !== newname) {
                await rename_entry(entry.uuid, newname);
                update_root_view_content();
            }
            renameentry.style.display = "none";
            // page.style.filter = "none";
            page.style.pointerEvents = "all";
        }
        renameentryinput.disabled = false;
        renameentrysubmit.disabled = false;
    });

    const entryhistory = document.getElementById("entryhistory");
    const entryhistoryclose = document.getElementById("entryhistoryclose");
    entryhistoryclose.addEventListener("click", function () {
        entryhistory.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
    });

    const entryshares = document.getElementById("entryshares");
    const entrysharesclose = document.getElementById("entrysharesclose");
    entrysharesclose.addEventListener("click", function () {
        entryshares.style.display = "none";
        // page.style.filter = "none";
        page.style.pointerEvents = "all";
    });

    const sharesnew = document.getElementById("sharesnew");
    const newshares = document.getElementById("newshares");
    const sharesnewusername = document.getElementById("sharesnewusername");
    const sharesnewaccessextend = document.getElementById("sharesnewaccessextend");
    newshares.addEventListener("click", async function () {
        sharesnewusername.value = "";
        sharesnewaccessextend.style.width = "1.75em";
        sharesnew.style.display = "block";
        // entryshares.style.filter = "blur(0.5px)";
        entryshares.style.pointerEvents = "none";
    });

    const entryshareslinka = document.getElementById("entryshareslinka");
    entryshareslinka.addEventListener("contextmenu", function (event) {
        event.stopPropagation();
    });

    const sharesnewclose = document.getElementById("sharesnewclose");
    const sharesnewerror = document.getElementById("sharesnewerror");
    sharesnewclose.addEventListener("click", function () {
        delete_all_childs(sharesnewerror);
        sharesnew.style.display = "none";
        // page.style.filter = "none";
        entryshares.style.pointerEvents = "all";
    });

    const sharesnewform = document.getElementById("sharesnewform");
    sharesnewform.addEventListener("submit", async function (event) {
        event.preventDefault();
        sharesnewusername.disabled = true;
        sharesnewsubmit.disabled = true;
        const widthtoaccess = {
            "1.75em":"r",
            "3.5em":"rw",
            "5.25em":"rwd",
        };
        const username = sharesnewusername.value;
        const accesslevel = widthtoaccess[sharesnewaccessextend.style.width];
        delete_all_childs(sharesnewerror);
        if (username === ""){
            const entry = get_active_entry();
            post_share(entry.uuid, null, accesslevel).then(async function () {
                generate_shares_content(await get_shares(entry.uuid), entry.uuid);
            });
            sharesnew.style.display = "none";
            // page.style.filter = "none";
            entryshares.style.pointerEvents = "all";
        } else {
            const uuid = await get_useruuid(username);
            if (uuid) {
                const entry = get_active_entry();
                post_share(entry.uuid, uuid, accesslevel).then(async function () {
                    generate_shares_content(await get_shares(entry.uuid), entry.uuid);
                });
                sharesnew.style.display = "none";
                // page.style.filter = "none";
                entryshares.style.pointerEvents = "all";
            } else {
                sharesnewerror.appendChild(document.createTextNode("This user does not exist"));
            }
        }
        sharesnewusername.disabled = false;
        sharesnewsubmit.disabled = false;
    });

    const sharesnewaccessiconview = document.getElementById("sharesnewaccessiconview");
    sharesnewaccessiconview.addEventListener("click", function () {
        sharesnewaccessextend.style.width = "1.75em";
    });
    const sharesnewaccessiconwrite = document.getElementById("sharesnewaccessiconwrite");
    sharesnewaccessiconwrite.addEventListener("click", function () {
        sharesnewaccessextend.style.width = "3.5em";
    });
    const sharesnewaccessicondelete = document.getElementById("sharesnewaccessicondelete");
    sharesnewaccessicondelete.addEventListener("click", function () {
        sharesnewaccessextend.style.width = "5.25em";
    });

    const deletemp = document.getElementById("delete");
    deletemp.addEventListener("click", async function () {
        const entry = get_active_entry();
        if (entry /*&& confirm("Delete this entry?")*/) {
            await delete_entry(entry.data.uuid);
            update_root_view_content();
        }
    });

    const remove = document.getElementById("remove");
    remove.addEventListener("click", async function () {
        const entry = get_active_entry();
        if (entry /*&& confirm("Remove this entry?")*/) {
            await delete_entry(entry.data.shareuuid);
            update_root_view_content();
        }
    });

    const download = document.getElementById("download");
    download.addEventListener("click", async function () {
        const entry = get_active_entry();
        if (entry) {
            const token = await get_download_token(entry.data.uuid);
            if (token) {
                window.location.href = "/api/v1/download/" + token;
            }
        }
    });

    const update = document.getElementById("update");
    update.addEventListener("click", async function () {
        fileupdate.style.display = "block";
        // page.style.filter = "blur(0.5px)";
        page.style.pointerEvents = "none";
    });

    const history = document.getElementById("history");
    history.addEventListener("click", async function () {
        const entry = get_active_entry();
        generate_history_content(await get_entry_history(entry.uuid));
        entryhistory.style.display = "block";
        // page.style.filter = "blur(0.5px)";
        page.style.pointerEvents = "none";
    });

    const sharewith = document.getElementById("sharewith");
    sharewith.addEventListener("click", async function () {
        const entry = get_active_entry();
        generate_shares_content(await get_shares(entry.uuid), entry.uuid);
        entryshares.style.display = "block";
        // page.style.filter = "blur(0.5px)";
        page.style.pointerEvents = "none";
    });

    const rename = document.getElementById("rename");
    rename.addEventListener("click", async function () {
        const entry = get_active_entry();
        renameentryinput.value = entry.data.name;
        renameentry.style.display = "block";
        // page.style.filter = "blur(0.5px)";
        page.style.pointerEvents = "none";
    });

    const explorer = document.getElementById("explorer");
    explorer.addEventListener("click", function (event) {
        if (event.just_set_active === undefined) {
            unset_all_active();
        }
    });

    const logged_in = await is_loggedin() || await attemt_login_with_saved();
    const initialloader = document.getElementById("initialloader");
    initialloader.parentNode.removeChild(initialloader);
    if (logged_in) {
        user_login(get_username());
    } else {
        user_logout();
    }

    window.addEventListener("focus", async function () {
        if (!await is_loggedin()) {
            user_logout();
        }
    });
    setInterval(attemt_extention, 60*1000);
});

