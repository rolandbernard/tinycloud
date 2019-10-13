
let loginusername = null;

window.addEventListener("load", async function () {
    const page = document.getElementById("page");
    const newbutton = document.getElementById("new");

    newbutton.addEventListener("click", function () {
        const newmenu = document.getElementById("newmenu");
        newmenu.style.display = "flex";
        page.addEventListener("click", function (event) {
            newmenu.style.display = "none";
            page.removeEventListener("click", this);
        });
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

function login_user(username) {
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
}

async function load_from_drive(path) {

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
    node.appendChild(nodefilesize);
    const opencontext = function (event) {
        console.log(event);
        const contextmenu = document.getElementById("contextmenu");
        contextmenu.style.display = "flex";
        contextmenu.style.left = String(node.offsetLeft + node.offsetWidth/20) + "px";
        contextmenu.style.top = String(node.offsetTop + node.offsetHeight*8/10) + "px";
        event.preventDefault();
        const page = document.getElementById("page");
        page.addEventListener("click", function (event) {
            contextmenu.style.display = "none";
            page.removeEventListener("click", this);
        });
    };
    node.addEventListener("contextmenu", opencontext);
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

function generate_subdirectory(after, data) {
    const node = document.createElement("div");
    node.className = "subdirectory";
    generate_dirview(node, data);
    after.parentNode.insertBefore(node, after.nextSibling);
}


