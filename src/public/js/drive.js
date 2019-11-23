
async function get_drive_data(uuid_or_null) {
    const token = get_token();
    try {
        const response = await fetch("/api/v1/drive/" + (uuid_or_null || ""), {
            method: "GET",
            headers: new Headers({
                "Authorization": ("Bearer " + token),
            })
        });
        if (response.status !== 200) {
            return false;
        } else {
            return await response.json();
        }
    } catch (err) {
        return false;
    }
}

async function get_download_token(uuid) {
    const token = get_token();
    try {
        const response = await fetch("/api/v1/auth/download/" + uuid, {
            method: "GET",
            headers: new Headers({
                "Authorization": ("Bearer " + token),
            })
        });
        if (response.status !== 200) {
            return false;
        } else {
            return (await response.json()).token;
        }
    } catch (err) {
        return false;
    }
}

async function get_shares(uuid) {
    const token = get_token();
    try {
        const response = await fetch("/api/v1/drive/" + uuid + "/share", {
            method: "GET",
            headers: new Headers({
                "Authorization": ("Bearer " + token),
            })
        });
        if (response.status !== 200) {
            return false;
        } else {
            return await response.json();
        }
    } catch (err) {
        return false;
    }
}

async function post_share(uuid, useruuid_or_null, accesslevel) {
    const token = get_token();
    let object;
    if (useruuid_or_null) {
        object = {
            useruuid : useruuid_or_null,
            accesslevel : accesslevel
        };
    } else {
        object = {
            accesslevel : accesslevel
        };
    }
    try {
        const response = await fetch("/api/v1/drive/" + uuid + "/share", {
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
            return true;
        }
    } catch (err) {
        return false;
    }
}

async function delete_share(uuid) {
    const token = get_token();
    try {
        const response = await fetch("/api/v1/drive/share/" + uuid, {
            method: "DELETE",
            headers: new Headers({
                "Authorization": ("Bearer " + token)
            })
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

async function delete_entry(uuid) {
    const token = get_token();
    try {
        const response = await fetch("/api/v1/drive/" + uuid, {
            method: "DELETE",
            headers: new Headers({
                "Authorization": ("Bearer " + token)
            })
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

async function rename_entry(uuid, name) {
    const token = get_token();
    const object = {
        newname: name
    };
    try {
        const response = await fetch("/api/v1/drive/" + uuid, {
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
            return true;
        }
    } catch (err) {
        return false;
    }
}

async function update_file(uuid, file) {
    const token = get_token();
    const data = new FormData();
    data.append("file", file);
    try {
        const response = await fetch("/api/v1/drive/" + uuid, {
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

async function move_entry(entryuuid, parentuuid_or_null) {
    const token = get_token();
    const object = {
        newparent: (parentuuid_or_null || null)
    };
    try {
        const response = await fetch("/api/v1/drive/" + entryuuid, {
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
            return true;
        }
    } catch (err) {
        return false;
    }
}

async function new_folder(uuid_or_null, name) {
    const token = get_token();
    const object = {
        foldername: name
    };
    try {
        const response = await fetch("/api/v1/drive/" + (uuid_or_null || ""), {
            method: "PUT",
            headers: new Headers({
                "Authorization": ("Bearer " + token),
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(object)
        });
        if (response.status !== 200) {
            return false;
        } else {
            return await response.json();
        }
    } catch (err) {
        return false;
    }
}

async function upload_file(uuid_or_null, file) {
    const token = get_token();
    const data = new FormData();
    data.append("file", file);
    try {
        const response = await fetch("/api/v1/drive/" + (uuid_or_null || ""), {
            method: "PUT",
            headers: new Headers({
                "Authorization": ("Bearer " + token)
            }),
            body: data
        });
        if (response.status !== 200) {
            return false;
        } else {
            return await response.json();
        }
    } catch (err) {
        return false;
    }
}

async function add_sharelink(uuid_or_null, sharedentryuuid) {
    const token = get_token();
    const object = {
        sharedentryuuid: sharedentryuuid
    };
    try {
        const response = await fetch("/api/v1/drive/" + (uuid_or_null || ""), {
            method: "PUT",
            headers: new Headers({
                "Authorization": ("Bearer " + token),
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(object)
        });
        if (response.status !== 200) {
            return false;
        } else {
            return await response.json();
        }
    } catch (err) {
        return false;
    }
}

async function get_entry_history(uuid) {
    const token = get_token();
    try {
        const response = await fetch("/api/v1/drive/" + uuid + "/history", {
            method: "GET",
            headers: new Headers({
                "Authorization": ("Bearer " + token),
            })
        });
        if (response.status !== 200) {
            return false;
        } else {
            return await response.json();
        }
    } catch (err) {
        return false;
    }
}
