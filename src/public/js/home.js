
let current_path = [];

function set_displayed_path(path) {
    const pathdiv = document.getElementById("path");
    delete_all_childs(pathdiv);
    const node = document.createElement("img");
    node.id = "pathroot";
    node.className = "pathelement";
    node.src = "/static/icon/home.svg";
    node.addEventListener("click", function () {
        change_path([]);
        history.pushState({ path: [] }, "Tinycloud", "?path=" + encodeURI(JSON.stringify([])));
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
            history.pushState({ path: path_prefix }, "Tinycloud", "?path=" + encodeURI(JSON.stringify(path_prefix)));
        });
        node.appendChild(document.createTextNode(seg.name));
        pathdiv.appendChild(node);
    });
}

function change_path(path) {
    current_path = path;
    set_displayed_path(path);
    unset_all_active();
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

async function startup() {
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
}

