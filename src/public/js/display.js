
let active_entry = null;

function get_active_entry() {
    return active_entry;
}

function generate_entry(data, path_prefix) {
    const node = document.createElement("div");
    node.path = path_prefix.concat([{ name: data.name, uuid: data.uuid }]);
    node.uuid = (data.isshare ? data.shareuuid : data.uuid);
    node.data = data;
    node.drive_data = data;
    node.className = "entry";
    node.id = "entry~" + (data.isshare ? data.shareuuid : data.uuid);
    const nodeiconname = document.createElement("div");
    nodeiconname.classList.add("dirviewcell");
    nodeiconname.classList.add("entryiconname");
    const nodeexpand = document.createElement("div");
    nodeexpand.className = "entryexpand";
    if (data.isfolder) {
        const nodeexpandsvg = document.createElement("img");
        nodeexpandsvg.className = "entryexpandsvg";
        nodeexpandsvg.src = "/static/icon/expand.svg";
        nodeexpandsvg.draggable = false;
        nodeexpand.appendChild(nodeexpandsvg);
        nodeexpand.addEventListener("click", function expand() {
            nodeexpandsvg.src = "/static/icon/expanded.svg";
            generate_subdirview_with_loader(node, get_drive_data((data.isshare ? data.shareuuid : data.uuid)));
            nodeexpand.removeEventListener("click", expand);
            nodeexpand.addEventListener("click", function collapse() {
                nodeexpandsvg.src = "/static/icon/expand.svg";
                node.parentElement.removeChild(node.nextSibling);
                nodeexpand.removeEventListener("click", collapse);
                nodeexpand.addEventListener("click", expand);
            });
        });
    }
    nodeiconname.appendChild(nodeexpand);
    const nodeicon = document.createElement("img");
    nodeicon.classList.add("dirviewcell");
    nodeicon.classList.add("entryicon");
    nodeicon.draggable = false;
    if (data.isfolder) {
        if (data.isshare) {
            nodeicon.src = "/static/icon/sharefolderblue.svg";
        } else {
            nodeicon.src = "/static/icon/folderblue.svg";
        }
    } else {
        if (data.isshare) {
            nodeicon.src = "/static/icon/sharefileblue.svg";
        } else {
            nodeicon.src = "/static/icon/fileblue.svg";
        }
    }
    nodeiconname.appendChild(nodeicon);
    const nodename = document.createElement("div");
    nodename.classList.add("dirviewcell");
    nodename.classList.add("entryname");
    nodename.appendChild(document.createTextNode(data.name));
    nodeiconname.appendChild(nodename);
    node.appendChild(nodeiconname);
    const nodeowner = document.createElement("div");
    nodeowner.classList.add("dirviewcell");
    nodeowner.classList.add("entrydetails");
    nodeowner.classList.add("entryowner");
    nodeowner.appendChild(document.createTextNode(generate_owner_string(data.owner)));
    node.appendChild(nodeowner);
    const nodelastmodified = document.createElement("div");
    nodelastmodified.classList.add("dirviewcell");
    nodelastmodified.classList.add("entrydetails");
    nodelastmodified.classList.add("entrylastmodified");
    nodelastmodified.appendChild(document.createTextNode(generate_lastmodified_string(data.lastmodifieddatetime, data.lastmodifieduser)));
    node.appendChild(nodelastmodified);
    const nodefilesize = document.createElement("div");
    nodefilesize.classList.add("dirviewcell");
    nodefilesize.classList.add("entrydetails");
    nodefilesize.classList.add("entryfilesize");
    nodefilesize.appendChild(document.createTextNode(generate_filesize_string(data.filesize)));
    node.append(nodefilesize);
    const contextmenu = document.getElementById("contextmenu");
    const renamemp = document.getElementById("rename");
    const updatemp = document.getElementById("update");
    const sharewithmp = document.getElementById("sharewith");
    const deletemp = document.getElementById("delete");
    const removemp = document.getElementById("remove");
    node.addEventListener("contextmenu", function (event) {
        event.just_set_active = true;
        event.just_opened_context = true;
        set_active(node);
        if (data.accesslevel.includes("w")) {
            renamemp.style.display = "block";
        } else {
            renamemp.style.display = "none";
        }
        if (data.accesslevel.includes("d")) {
            deletemp.style.display = "block";
            sharewithmp.style.display = "block";
        } else {
            deletemp.style.display = "none";
            sharewithmp.style.display = "none";
        }
        if (!data.isfolder && data.accesslevel.includes("w")) {
            updatemp.style.display = "block";
        } else {
            updatemp.style.display = "none";
        }
        if (data.isshare && data.directaccesslevel.includes("d")) {
            removemp.style.display = "block";
        } else {
            removemp.style.display = "none"
        }
        contextmenu.style.display = "flex";
        contextmenu.style.left = String(event.pageX) + "px";
        contextmenu.style.top = String(event.pageY - (Math.sin((event.pageY / window.innerHeight) * Math.PI / 2) * contextmenu.clientHeight)) + "px";
        function handl(event) {
            if (event.just_opened_context === undefined) {
                contextmenu.style.display = "none";
                window.removeEventListener("click", handl);
                window.removeEventListener("contextmenu", handl);
                window.removeEventListener("dblclick", handl);
            }
        }
        window.addEventListener("click", handl);
        window.addEventListener("contextmenu", handl);
        window.addEventListener("dblclick", handl);
    });
    node.addEventListener("click", function (event) {
        event.just_set_active = true;
        set_active(node);
    });
    if ((!data.isshare && data.accesslevel.includes("d")) || (data.isshare && data.directaccesslevel.includes("d"))) {
        node.draggable = true;
        node.addEventListener("dragstart", function (event) {
            event.dataTransfer.effectAllowed = "move";
            const parentuuid = (path_prefix.length > 0 ? path_prefix[path_prefix.length - 1].uuid : null);
            event.dataTransfer.setData("application/json", JSON.stringify({
                entryuuid : (data.isshare ? data.shareuuid : data.uuid),
                parentuuid : parentuuid,
            }));
            event.dataTransfer.setDragImage(nodeicon, 0, 0);
        });
    }
    if (data.isfolder) {
        node.addEventListener("dblclick", function () {
            change_path(node.path);
            history.pushState({ path: node.path }, "Tinycloud", "?path=" + encodeURI(JSON.stringify(node.path)));
        });
    } else {
        node.addEventListener("dblclick", async function () {
            const token = await get_download_token(data.uuid);
            if (token) {
                window.location.href = "/api/v1/download/" + token;
            }
        });
    }
    return node;
}

function generate_dirview(data, path) {
    const node = document.createElement("div");
    node.className = "dirview";
    node.id = "dirview~" + ((data.isshare ? data.shareuuid: data.uuid) || "root");
    node.path = path;
    node.uuid = ((data.isshare ? data.shareuuid: data.uuid) || null);
    node.data = data;
    if (path.length === 0 || data.accesslevel.includes("w")) {
        let enter_exit = 0;
        node.addEventListener("dragenter", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (enter_exit === 0) {
                node.classList.add("dirviewdrag");
                unset_all_active();
            }
            enter_exit++;
        });
        node.addEventListener("dragover", function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
        node.addEventListener("dragleave", function (event) {
            event.stopPropagation();
            enter_exit--;
            if (enter_exit === 0) {
                node.classList.remove("dirviewdrag");
            }
        });
        node.addEventListener("drop", function (event) {
            event.preventDefault();
            event.stopPropagation();
            const drag_data = JSON.parse(event.dataTransfer.getData("application/json") || "null");
            if (drag_data && drag_data.entryuuid && drag_data.entryuuid.length === 36) {
                if (drag_data.parentuuid !== data.uuid) {
                    move_entry(drag_data.entryuuid, data.uuid).then(function () {
                        update_root_view_content();
                    });
                }
            } else {
                upload_files_folders_drop(data.uuid, Array.from(event.dataTransfer.items).filter(function (el) {
                    return el.kind === "file";
                }));
            }
            enter_exit = 0;
            node.classList.remove("dirviewdrag");
        });
    }
    data.content.forEach(function (entry) {
        node.appendChild(generate_entry(entry, path));
    });
    return node;
}

function generate_loader() {
    const node = document.createElement("div");
    node.className = "loaderellipsis";
    for(let i = 0; i < 4; i++) {
        node.appendChild(document.createElement("div"));
    }
    return node;
}

async function generate_subdirview_with_loader(after, data_promise) {
    const node = document.createElement("div");
    node.className = "subdirectory";
    node.appendChild(generate_loader())
    after.parentNode.insertBefore(node, after.nextSibling);
    const data = await data_promise;
    delete_all_childs(node);
    node.appendChild(generate_dirview(data, after.path));
}

async function generate_root_directory_content(data_promise, path) {
    const node = document.getElementById("rootdirectory");
    delete_all_childs(node);
    node.appendChild(generate_loader())
    const data = await data_promise;
    delete_all_childs(node);
    node.appendChild(generate_dirview(data, path));
}

function delete_all_childs(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function set_active(node) {
    unset_all_active();
    node.classList.add("entryactive");
    active_entry = node;
}

function unset_all_active() {
    const elements = document.getElementsByClassName("entryactive");
    Array.from(elements).forEach(function (el) {
        el.classList.remove("entryactive");
    });
    active_entry = null;
}

function generate_owner_string(owner) {
    if (get_username() === owner) {
        return "me";
    } else {
        return owner;
    }
}

function generate_datetime_string(datetime) {
    const d = new Date(datetime);
    let now_minus_one = new Date();
    now_minus_one.setDate(now_minus_one.getDate() - 1);
    if (d.getTime() > now_minus_one.getTime()) {
        return d.toLocaleTimeString();
    } else {
        return d.toLocaleDateString();
    }
}

function generate_lastmodified_string(datetime, user) {
    return generate_datetime_string(datetime) + ", " + generate_owner_string(user);
}

function generate_filesize_string(filesize) {
    if (typeof (filesize) !== "number") {
        return "-";
    } else {
        const units = [
            "B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"
        ];
        let unit_index = 0;
        let amount = Math.trunc(filesize);
        while (amount >= 1000 && unit_index < units.length - 1) {
            amount /= 1000;
            unit_index++;
        }
        let decimals;
        if (amount >= 100) {
            decimals = 1;
        } else if (amount >= 10) {
            decimals = 10;
        } else {
            decimals = 100;
        }
        return String(Math.round(amount * decimals) / decimals) + " " + units[unit_index];
    }
}

async function update_root_view_content() {
    const root = document.getElementById("rootdirectory");
    const root_dirview = root.childNodes[0];
    await update_dirview_recursively(root_dirview);
}

async function update_dirview_recursively(node) {
    const data = await get_drive_data(node.uuid);
    const childs = Array.from(node.childNodes);
    childs.forEach(function (child) {
        if (child.className === "subdirectory") {
            const child_dirview = child.childNodes[0];
            const child_data = data.content.find(function (el) {
                return (el.isshare ? el.shareuuid : el.uuid) === child_dirview.uuid;
            });
            if (child_data) {
                update_dirview_recursively(child_dirview);
            } else {
                node.removeChild(child);
            }
        } else {
            const child_data = data.content.find(function (el) {
                return (el.isshare ? el.shareuuid : el.uuid) === child.uuid;
            });
            if (child_data) {
                update_entry(child, child_data);
            } else {
                node.removeChild(child);
            }
        }
    });
    data.content.forEach(function (el) {
        const child = childs.find(function (child) {
            return (el.isshare ? el.shareuuid : el.uuid) === child.uuid;
        });
        if (!child) {
            const prev_child = childs.find(function (child) {
                return child.className !== "subdirectory" && ((el.isfolder >= child.data.isfolder && el.name < child.data.name) || el.isfolder > child.data.isfolder);
            });
            if (prev_child) {
                node.insertBefore(generate_entry(el, node.path), prev_child);
            } else {
                node.appendChild(generate_entry(el, node.path));
            }
        }
    });
}

function update_entry(oldnode, data) {
    const nodename = oldnode.childNodes[0].childNodes[2];
    const nodeowner = oldnode.childNodes[1];
    const nodelastmodified = oldnode.childNodes[2];
    const nodefilesize = oldnode.childNodes[3];
    delete_all_childs(nodename);
    nodename.appendChild(document.createTextNode(data.name));
    delete_all_childs(nodeowner);
    nodeowner.appendChild(document.createTextNode(generate_owner_string(data.owner)));
    delete_all_childs(nodelastmodified);
    nodelastmodified.appendChild(document.createTextNode(generate_lastmodified_string(data.lastmodifieddatetime, data.lastmodifieduser)));
    delete_all_childs(nodefilesize);
    nodefilesize.appendChild(document.createTextNode(generate_filesize_string(data.filesize)));
    oldnode.data = data;
}

function generate_history_content(data) {
    const historylist = document.getElementById("entryhistorylist");
    delete_all_childs(historylist);
    data.forEach(function (el) {
        historylist.appendChild(generate_history_entry(el));
    });
}

function generate_history_entry(data) {
    const node = document.createElement("div");
    node.className = "historyentry";
    const nodeuser = document.createElement("div");
    nodeuser.className = "historycell";
    const nodeuseravatar = document.createElement("img");
    nodeuseravatar.className = "historyuseravatar";
    nodeuseravatar.src = "/api/v1/user/" + encodeURI(data.user) + "/avatar";
    nodeuser.appendChild(nodeuseravatar);
    const nodeusertext = document.createElement("div");
    nodeusertext.className = "historyusername";
    nodeusertext.appendChild(document.createTextNode(data.user));
    nodeuser.appendChild(nodeusertext);
    node.appendChild(nodeuser);
    const nodedate = document.createElement("div");
    nodedate.classList.add("historycell");
    nodedate.classList.add("historycelldate");
    nodedate.appendChild(document.createTextNode(generate_datetime_string(data.datetime)));
    node.appendChild(nodedate);
    const actiontofile = {
        "create":"upload.svg",
        "rename":"edit.svg",
        "move":"move.svg",
        "update":"update.svg",
    };
    const nodeaction = document.createElement("div");
    nodeaction.className = "historycell";
    const nodeactionicon = document.createElement("img");
    nodeactionicon.className = "historyactionicon";
    nodeactionicon.src = "/static/icon/" + actiontofile[data.action];
    nodeaction.appendChild(nodeactionicon);
    const nodeactiontext = document.createElement("div");
    nodeactiontext.className = "historyactiontext";
    nodeactiontext.appendChild(document.createTextNode(data.action));
    nodeaction.appendChild(nodeactiontext);
    node.appendChild(nodeaction);
    return node;
}

function generate_shares_content(data, entryuuid) {
    const shareslist = document.getElementById("entryshareslist");
    const linka = document.getElementById("entryshareslinka");
    delete_all_childs(linka);
    const link = window.location.origin + "/share/" + entryuuid;
    linka.appendChild(document.createTextNode(link));
    linka.href = link;
    delete_all_childs(shareslist);
    data.forEach(function (el) {
        shareslist.appendChild(generate_shares_entry(el));
    });
}

function generate_shares_entry(data) {
    const node = document.createElement("div");
    node.className = "sharesentry";
    const nodeuser = document.createElement("div");
    nodeuser.className = "sharescell";
    const nodeuseravatar = document.createElement("img");
    nodeuseravatar.className = "sharesuseravatar";
    nodeuseravatar.src = "/api/v1/user/" + encodeURI(data.user) + "/avatar";
    nodeuser.appendChild(nodeuseravatar);
    const nodeusertext = document.createElement("div");
    nodeusertext.className = "sharesusername";
    nodeusertext.appendChild(document.createTextNode(data.user));
    nodeuser.appendChild(nodeusertext);
    node.appendChild(nodeuser);
    const nodeaccess = document.createElement("div");
    nodeaccess.className = "sharescell";
    const nodeaccessexpand = document.createElement("div");
    nodeaccessexpand.className = "sharesaccessextend";
    const accesstowidth = {
        "r":"1.75em",
        "rw":"3.5em",
        "rwd":"5.25em",
    };
    nodeaccessexpand.style.width = accesstowidth[data.accesslevel];
    nodeaccess.appendChild(nodeaccessexpand);
    const nodeaccessview = document.createElement("img");
    nodeaccessview.className = "sharesaccessicon";
    nodeaccessview.src = "/static/icon/view.svg";
    nodeaccess.appendChild(nodeaccessview);
    const nodeaccessedit = document.createElement("img");
    nodeaccessedit.className = "sharesaccessicon";
    nodeaccessedit.src = "/static/icon/edit.svg";
    nodeaccess.appendChild(nodeaccessedit);
    const nodeaccessdelete = document.createElement("img");
    nodeaccessdelete.className = "sharesaccessicon";
    nodeaccessdelete.src = "/static/icon/delete.svg";
    nodeaccess.appendChild(nodeaccessdelete);
    node.appendChild(nodeaccess);
    const nodeaction = document.createElement("div");
    nodeaction.classList.add("sharescell");
    nodeaction.classList.add("sharesactioncell");
    const nodeactionedit = document.createElement("input");
    const entryshares = document.getElementById("entryshares");
    const sharesnew = document.getElementById("sharesnew");
    const sharesnewusername = document.getElementById("sharesnewusername");
    const sharesnewaccessextend = document.getElementById("sharesnewaccessextend");
    nodeactionedit.addEventListener("click", async function () {
        sharesnewusername.value = (data.user === "all" ? "" : data.user);
        sharesnewaccessextend.style.width = accesstowidth[data.accesslevel];
        sharesnew.style.display = "block";
        // entryshares.style.filter = "blur(0.5px)";
        entryshares.style.pointerEvents = "none";
    });
    nodeactionedit.className = "sharesedit";
    nodeactionedit.type = "button";
    nodeactionedit.value = "Edit";
    nodeaction.appendChild(nodeactionedit);
    const nodeactiondelete = document.createElement("input");
    const entry = get_active_entry();
    nodeactiondelete.addEventListener("click", async function () {
        delete_share(data.uuid);
        generate_shares_content(await get_shares(entry.data.uuid), entry.data.uuid);
    });
    nodeactiondelete.className = "sharesdelete";
    nodeactiondelete.type = "button";
    nodeactiondelete.value = "Delete";
    nodeaction.appendChild(nodeactiondelete);
    node.appendChild(nodeaction);
    return node;
}

