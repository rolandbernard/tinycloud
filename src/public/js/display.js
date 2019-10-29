
let active_entry = null;

function get_active_entry() {
    return active_entry;
}

function generate_entry(data, path_offset) {
    const node = document.createElement("div");
    node.path_offset = path_offset.concat([{ name: data.name, uuid: data.uuid }]);
    node.drive_data = data;
    node.className = "entry";
    node.id = "entry~" + data.uuid;
    const nodeiconname = document.createElement("div");
    nodeiconname.classList.add("dirviewcell");
    nodeiconname.classList.add("entryiconname");
    const nodeexpand = document.createElement("div");
    nodeexpand.className = "entryexpand";
    if (data.isfolder) {
        const nodeexpandsvg = document.createElement("img");
        nodeexpandsvg.className = "entryexpandsvg";
        nodeexpandsvg.src = "/static/icon/expand.svg";
        nodeexpand.appendChild(nodeexpandsvg);
        nodeexpand.addEventListener("click", function expand() {
            nodeexpandsvg.src = "/static/icon/expanded.svg";
            generate_subdirview_with_loader(node, get_drive_data(data.uuid));
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
    node.addEventListener("contextmenu", function (event) {
        event.just_set_active = true;
        event.just_opened_context = true;
        set_active(node);
        const contextmenu = document.getElementById("contextmenu");
        const renamemp = document.getElementById("rename");
        const updatemp = document.getElementById("update");
        const sharewithmp = document.getElementById("sharewith");
        const deletemp = document.getElementById("delete");
        const removemp = document.getElementById("remove");
        if(data.accesslevel.includes("w")) {
            renamemp.style.display = "block";
            updatemp.style.display = "block";
            sharewithmp.style.display = "block";
        } else {
            renamemp.style.display = "none";
            updatemp.style.display = "none";
            sharewithmp.style.display = "none";
        }
        if(data.accesslevel.includes("d")) {
            deletemp.style.display = "block";
        } else {
            deletemp.style.display = "none";
        }
        if(data.isshare && data.directaccesslevel.includes("d")) {
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
    if (data.isfolder) {
        node.addEventListener("dblclick", function (event) {
            change_path(get_current_path().concat(node.path_offset));
        });
    }
    return node;
}

function generate_dirview(data, path_offset) {
    const node = document.createElement("div");
    node.className = "dirview";
    node.id = "dirview~" + data.uuid;
    data.content.forEach(function (entry) {
        node.appendChild(generate_entry(entry, path_offset));
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
    node.appendChild(generate_dirview(data, after.path_offset));
}

async function generate_root_directory_content(data_promise) {
    const node = document.getElementById("rootdirectory");
    delete_all_childs(node);
    node.appendChild(generate_loader())
    const data = await data_promise;
    delete_all_childs(node);
    node.appendChild(generate_dirview(data, []));
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
}

function set_displayed_path(path) {
    const pathdiv = document.getElementById("path");
    delete_all_childs(pathdiv);
    const node = document.createElement("img");
    node.id = "pathroot";
    node.className = "pathelement";
    node.src = "/static/icon/home.svg";
    node.addEventListener("click", function () {
        change_path([]);
    });
    pathdiv.appendChild(node);
    path.forEach(function (seg) {
        const seperator = document.createElement("div");
        seperator.className = "pathseperator";
        pathdiv.appendChild(seperator);
        const node = document.createElement("div");
        node.className = "pathelement";
        const path_prefix = path.slice(0, path.indexOf(seg) + 1);
        node.addEventListener("click", function () {
            change_path(path_prefix);
        });
        node.appendChild(document.createTextNode(seg.name));
        pathdiv.appendChild(node);
    });
}

function generate_owner_string(owner) {
    if (get_username() === owner) {
        return "me";
    } else {
        return owner;
    }
}

function generate_lastmodified_string(datetime, user) {
    const d = new Date(datetime);
    let now_minus_one = new Date();
    now_minus_one.setDate(now_minus_one.getDate() - 1);
    if (d.getTime() > now_minus_one.getTime()) {
        return d.toLocaleTimeString() + ", " + generate_owner_string(user);
    } else {
        return d.toLocaleDateString() + ", " + generate_owner_string(user);
    }
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
