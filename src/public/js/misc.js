
let current_path = [];

function change_path(path) {
    current_path = path;
    set_displayed_path(path);
    generate_root_directory_content(get_drive_data(path.length > 0 ? path[path.length - 1].uuid : null));
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

window.addEventListener("load", async function () {
    const loginform = document.getElementById("loginform");
    loginform.addEventListener("submit", async function (event) {
        event.preventDefault();
        const usernameinput = document.getElementById("username");
        const passwordinput = document.getElementById("password");
        const loginsubmit = document.getElementById("signin");
        const rememberme = document.getElementById("rememberme");
        usernameinput.disabled = true;
        passwordinput.disabled = true;
        loginsubmit.disabled = true;
        rememberme.disabled = true;
        const infotexterror = document.getElementById("infotexterror");
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
    newbutton.addEventListener("click", function (event) {
        event.just_opened_new = true;
        const newmenu = document.getElementById("newmenu");
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

    const userbutton = this.document.getElementById("user");
    userbutton.addEventListener("click", function (event) {
        event.just_opened_user = true;
        const usermenu = document.getElementById("usermenu");
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

    const logged_in = await is_loggedin() || await attemt_login_with_saved();
    const initialloader = document.getElementById("initialloader");
    initialloader.parentNode.removeChild(initialloader);
    if (logged_in) {
        user_login(get_username());
    } else {
        user_logout();
    }

    window.addEventListener("focus", async function () {
        if(!await is_loggedin()) {
            user_logout();
        }
    });
});

window.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

window.addEventListener("click", function (event) {
    if (event.just_set_active === undefined) {
        unset_all_active();
    }
});
