
async function get_drive_data(uuid_or_null) {
    if(uuid_or_null === null) {
        const token = get_token();
        const response = await fetch("/api/v1/drive", {
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
    } else {
        const token = get_token();
        const response = await fetch("/api/v1/drive/" + uuid_or_null, {
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
}

function get_download_token(uuid) {
    
}

function get_shares(uuid) {

}

function posed_share(uuid, username) {

}

function delete_share(uuid) {

}

function delete_entry(uuid) {

}

function rename_entry(uuid) {

}

function update_file(uuid) {

}

function get_entry_history(uuid) {

}
