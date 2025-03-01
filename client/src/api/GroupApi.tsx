import axios from "axios"



export async function createGroupApi(serverUrl: string, groupData: object) {
    const response = await axios.post(serverUrl + '/create-group', groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

// Getting users and groups

export async function getGroupsApi(serverUrl: string) {
    const response = await axios.get(serverUrl + '/getGroups', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function getGroupByNameApi(serverUrl: string, name: string) {
    const response = await axios.get(serverUrl + '/getGroup/' + name, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function editGroupProfileApi(serverUrl: string, group: string, groupData: object) {
    const response = await axios.put(serverUrl + '/editGroupProfile/' + group, groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function addMemberApi(serverUrl: string, groupData: object) {
    const response = await axios.post(serverUrl + '/addMember', groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function createGroup(serverUrl: string, groupData: {
    groupName: string;
    description: string;
    members: string[];
}) {
    const response = await axios.post(serverUrl + '/createGroup', groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response;
}

export async function updateGroup(serverUrl: string, group: string, groupData: object) {
    const response = await axios.put(serverUrl + '/updateGroup/' + group, groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response;
}
