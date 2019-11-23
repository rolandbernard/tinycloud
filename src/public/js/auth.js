
async function attemt_login(username, password, save_in_localstorage) {
    const object = {
        username: username,
        password: password
    };
    try {
        const response = await fetch("/api/v1/auth/gettoken", {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(object)
        });
        if (response.status !== 200) {
            return false;
        } else {
            const data = await response.json();
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("username", username);
            if (save_in_localstorage) {
                localStorage.setItem("username", username);
                localStorage.setItem("password", password);
            }
            return true;
        }
    } catch (err) {
        return false;
    }
}

async function attemt_login_with_saved() {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (username !== null && password !== null) {
        const success = await attemt_login(username, password);
        if (!success) {
            delete_credentials();
        }
        return success;
    } else {
        return false;
    }
}

async function is_loggedin() {
    const token = get_token();
    if (token !== null) {
        try {
            const response = await fetch("/api/v1/auth/test", {
                method: "GET",
                headers: new Headers({
                    "Authorization": ("Bearer " + token)
                })
            });
            if (response.status === 401) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("username");
                return false;
            } else {
                return true;
            }
        } catch (err) {
            return false;
        }
    } else {
        return false;
    }
}

async function attemt_extention() {
    const token = get_token();
    if (token !== null) {
        try {
            const response = await fetch("/api/v1/auth/extend", {
                method: "GET",
                headers: new Headers({
                    "Authorization": ("Bearer " + token)
                })
            });
            if (response.status !== 200) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("username");
                return false;
            } else {
                const data = await response.json();
                sessionStorage.setItem("token", data.token);
                return true;
            }
        } catch (err) {
            return false;
        }
    } else {
        return false;
    }
}

function get_username() {
    return sessionStorage.getItem("username");
}

function get_token() {
    return sessionStorage.getItem("token");
}

function get_token_payload() {
    const token = get_token();
    if (token !== null) {
        var base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        var json_string = atob(base64);
        return JSON.parse(json_string);
    } else {
        return null;
    }
};

function delete_credentials() {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
}

async function change_password(password) {
    const token = get_token();
    const object = {
        password: password
    };
    try {
        const response = await fetch("/api/v1/user/password", {
            method: "POST",
            headers: new Headers({
                "Authorization": ("Bearer " + token),
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(object)
        });
        if (response.status !== 200) {
            return false;
        } else {
            if (localStorage.getItem("password") !== null) {
                localStorage.setItem("password", password);
            }
            return true;
        }
    } catch (err) {
        return false;
    }
}

async function change_avatar(file) {
    const token = get_token();
    const data = new FormData();
    data.append("file", file);
    try {
        const response = await fetch("/api/v1/user/avatar", {
            method: "POST",
            headers: new Headers({
                "Authorization": ("Bearer " + token)
            }),
            body: data
        });
        if (response.status !== 200) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        return false;
    }
}

async function get_useruuid(username) {
    const token = get_token();
    if (token !== null) {
        try {
            const response = await fetch("/api/v1/user/" + username, {
                method: "GET",
            });
            if (response.status !== 200) {
                return false;
            } else {
                return await response.json();
            }
        } catch (err) {
            return false;
        }
    } else {
        return false;
    }
}

