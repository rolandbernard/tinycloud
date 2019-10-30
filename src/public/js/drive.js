
async function get_drive_data(uuid_or_null) {
    const token = get_token();
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
}

async function get_download_token(uuid) {
    const token = get_token();
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
}

function get_shares(uuid) {

}

function post_share(uuid, username) {

}

function delete_share(uuid) {

}

async function delete_entry(uuid) {
    const token = get_token();
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
}

function rename_entry(uuid) {

}

function update_file(uuid) {

}

async function new_folder(uuid_or_null, name) {
    const token = get_token();
    const object = {
        foldername: name
    };
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
}

async function upload_file(uuid_or_null, file) {
    const token = get_token();
    const data = new FormData();
    data.append("file", file);
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
}

function add_sharelink(uuid_or_null, sharedentryuuid) {

}

function get_entry_history(uuid) {

}
