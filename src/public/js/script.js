
let loginusername = null;

window.addEventListener("load", async function () {
    const newbutton = document.getElementById("new");

    newbutton.addEventListener("click", function (event) {
        const newmenu = document.getElementById("newmenu");
        if(newmenu.style.display === "none") {
            newmenu.style.display = "flex";
            setup_hiding_listeners(newmenu, event);
        }
    });

    const userbutton = this.document.getElementById("user");

    userbutton.addEventListener("click", function (event) {
        const usermenu = document.getElementById("usermenu");
        if(usermenu.style.display === "none") {
            usermenu.style.display = "flex";
            setup_hiding_listeners(usermenu, event);
        }
    });

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
        generate_loader(infotexterror);
        
        // try to authenticate
        const username = usernameinput.value;
        const password = passwordinput.value;
        if(username === "" || password === "") {
            delete_all_childs(infotexterror);
            infotexterror.appendChild(document.createTextNode("Enter username and password"));
        } else {
            const success = await attemt_login(username, password);
            if(success) {
                if(rememberme.checked) {
                    window.localStorage.setItem("username", username);
                    window.localStorage.setItem("password", password);
                }
                login_user(username);
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
    
    const logout = document.getElementById("logout");

    logout.addEventListener("click", function () {
        logout_user();
        window.localStorage.removeItem("username");
        window.localStorage.removeItem("password");
    });
    
    const explorer = document.getElementById("explorer");
    const login = document.getElementById("login");

    const username = window.localStorage.getItem("username");
    const password = window.localStorage.getItem("password");
    const success = await attemt_login(username, password);
    if(success) {
        login_user(username);
    } else {
        window.localStorage.removeItem("username");
        window.localStorage.removeItem("password");
        login.style.display = "block";
    }

    const initialloader = document.getElementById("initialloader");
    initialloader.parentNode.removeChild(initialloader);
});

function setup_hiding_listeners(node, ignore, special) {
    function hide(e) {
        if(e !== ignore) {
            node.style.display = "none";
            if(special) {
                special();
            }
            window.removeEventListener("click", hide);
            window.removeEventListener("contextmenu", hide);
            window.removeEventListener("dblclick", hide);
        }
    }
    window.addEventListener("click", hide);
    window.addEventListener("contextmenu", hide);
    window.addEventListener("dblclick", hide);
}

function login_user(username) {
    loginusername = username;
    const explorer = document.getElementById("explorer"); 
    const login = document.getElementById("login");
    const newbutton = document.getElementById("new");
    explorer.style.display = "flex";
    newbutton.style.display = "block";
    delete_all_childs(infotexterror);
    login.style.display = "none";
    const user = document.getElementById("user");
    const node = document.createElement("img");
    node.id = "useravatar";
    node.src = "/avatar/" + encodeURI(username);
    user.appendChild(node);
    const url = new URL(window.location.href);
    const query_string = url.search;
    const search_params = new URLSearchParams(query_string); 
    const path = decodeURI(search_params.get('path') || "/");
    set_path_display(path);
    set_rootdirectory(load_from_drive(path));
}

function logout_user() {
    loginusername = null;
    const explorer = document.getElementById("explorer"); 
    const login = document.getElementById("login");
    const newbutton = document.getElementById("new");
    explorer.style.display = "none";
    newbutton.style.display = "none";
    delete_all_childs(infotexterror);
    login.style.display = "block";
    const user = document.getElementById("user");
    delete_all_childs(user);
    const root = document.getElementById("rootdirectory");
    delete_all_childs(root);
    const pathdiv = document.getElementById("path");
    delete_all_childs(pathdiv);
}

async function load_from_drive(path) {
    await new Promise((promise) => setTimeout(promise, 1000));
    return {
        content:[
            {
                absolutepath:"/test/hello/gg.txt",
                name:"gg.txt",
                isfolder:false,
                lastmodifieddatetime:"2019-04-03 12:03",
                lastmodifieduser:"MrMobi",
                owner:"roqqnggehhppd",
                filesize:17235
            },
            {
                absolutepath:"/test/hello/gg",
                name:"gg",
                isfolder:true,
                lastmodifieddatetime:"2019-04-03 12:03",
                lastmodifieduser:"MrMobi",
                owner:"roqqnggehhppd",
            },
            {
                absolutepath:"/test/hello/gg.txt",
                name:"gg.txt",
                isfolder:false,
                lastmodifieddatetime:"2019-04-03 12:03",
                lastmodifieduser:"test",
                owner:"roqqnggehhppd",
                filesize:17235023293872873
            }
        ]
    };
}

async function attemt_login(username, password) {
    if(username === null || password === null)
        return false;
    return true;
}

function delete_all_childs(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function generate_loader(parent) {
    const node = document.createElement("div");
    node.className = "loaderellipsis";
    for(let i = 0; i < 4; i++) {
        node.appendChild(document.createElement("div"));
    }
    parent.appendChild(node);
}

function generate_owner_string(owner) {
    if(loginusername === owner) {
        return "me";
    } else {
        return owner;
    }
}

function generate_lastmodified_string(datetime, user) {
    let d = new Date(datetime);
    let nowminusone = new Date();
    nowminusone.setDate(nowminusone.getDate()-1);
    if(d.getTime() > nowminusone.getTime()) {
        return d.toLocaleTimeString() + ", " + generate_owner_string(user);
    } else {
        return d.toLocaleDateString() + ", " + generate_owner_string(user);
    }
}

function generate_filesize_string(size) {
    if(size == null) {
        return "-";
    } else {
        const units = [
            "B", "kB", "MB", "GB", "TB", "PB", "EB"
        ]
        let i = 0;
        let ret = Math.trunc(size);
        while(ret > 5000) {
            ret = Math.trunc(ret/1000);
            i++;
        }
        return String(ret) + units[i];
    }
}

/*{
    name:"",
    absolutepath:"",
    owner:"",
    lastmodifieddatetime:"",
    lastmodifieduser:"",
    filesize:0,
    isfolder:false
}*/
function generate_entry(parent, data) {
    const node = document.createElement("div");
    node.className = "entry";
    const nodeiconname = document.createElement("div");
    nodeiconname.classList.add("dirviewcell");
    nodeiconname.classList.add("entryiconname");
    const nodeexpand = document.createElement("div");
    nodeexpand.className = "entryexpand";
    if(data.isfolder) {
        const nodeexpandsvg = document.createElement("img");
        nodeexpandsvg.className = "entryexpandsvg";
        nodeexpandsvg.src = "/static/icon/expand.svg";
        nodeexpand.appendChild(nodeexpandsvg);
        nodeexpand.addEventListener("click", function expand() {
            nodeexpandsvg.src = "/static/icon/expanded.svg";
            generate_subdirectory(node, load_from_drive(data.absolutepath));
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
    if(data.isfolder) {
        nodeicon.src = "/static/icon/folderblue.svg";
    } else {
        nodeicon.src = "/static/icon/fileblue.svg";
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
        const contextmenu = document.getElementById("contextmenu");
        if(contextmenu.style.display === "none") {
            node.classList.add("entryactive");
            contextmenu.style.display = "flex";
            contextmenu.style.left = String(event.pageX) + "px";
            contextmenu.style.top = String(event.pageY-(Math.sin((event.pageY/window.innerHeight)*Math.PI/2)*contextmenu.clientHeight)) + "px";
            setup_hiding_listeners(contextmenu, event, function () {
                node.classList.remove("entryactive");
            });
        }
        event.preventDefault();
    });
    parent.appendChild(node);
}

/*{
    name:"",
    absolutepath:"",
    owner:"",
    lastmodifieddatetime:"",
    lastmodifieduser:"",
    filesize:0,
    isfolder:true,
    content=[
        {
            name:"",
            absolutepath:"",
            owner:"",
            lastmodifieddatetime:"",
            lastmodifieduser:"",
            filesize:0,
            isfolder:false
        }
    ]
}*/
function generate_dirview(parent, data) {
    const node = document.createElement("div");
    node.className = "dirview";
    data.content.forEach(function (entry) {
        generate_entry(node, entry);
    });
    parent.appendChild(node);
}

async function generate_subdirectory(after, data_promise) {
    const node = document.createElement("div");
    node.className = "subdirectory";
    generate_loader(node);
    after.parentNode.insertBefore(node, after.nextSibling);
    const data = await data_promise;
    delete_all_childs(node);
    generate_dirview(node, data);
}

async function set_rootdirectory(data_promise) {
    const node = document.getElementById("rootdirectory");
    delete_all_childs(node);
    generate_loader(node);
    const data = await data_promise;
    delete_all_childs(node);
    generate_dirview(node, data);
}

function set_path_display(path) {
    const pathdiv = document.getElementById("path");
    delete_all_childs(pathdiv);
    const node = document.createElement("img");
    node.id = "pathroot";
    node.className = "pathelement";
    node.src = "/static/icon/home.svg";
    pathdiv.appendChild(node);
    const pathseg = path.split("/");
    pathseg.filter(function (seg) {
        return seg !== "";
    }).forEach(function (seg) {
        const seperator = document.createElement("div");
        seperator.className = "pathseperator";
        pathdiv.appendChild(seperator);
        const node = document.createElement("div");
        node.className = "pathelement";
        node.appendChild(document.createTextNode(seg));
        pathdiv.appendChild(node);
    });
}

