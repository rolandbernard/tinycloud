
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
    change_path([]);
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

    const uploadfile = document.getElementById("uploadfile");
    uploadfile.addEventListener("click", function () {
        fileupload.style.display = "block";
        // page.style.filter = "blur(0.5px)";
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

    const logout = document.getElementById("logout");
    logout.addEventListener("click", function () {
        user_logout();
    });

    const fileupload = document.getElementById("fileupload");
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
});

window.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});