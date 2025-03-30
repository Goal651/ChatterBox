import axios from "axios"
import { HandleApiError } from "./error";



export async function createGroupApi(serverUrl: string, groupData: object) {
    try {
        const response = await axios.post(serverUrl + '/create-group', groupData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

// Getting users and groups

export async function getGroupsApi(serverUrl: string) {
    try {
        const response = await axios.get(serverUrl + '/getGroups', {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function getGroupByNameApi(serverUrl: string, name: string) {
    try {
        const response = await axios.get(serverUrl + '/getGroup/' + name, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function editGroupProfileApi(serverUrl: string, group: string, groupData: object) {
    try {
        const response = await axios.put(serverUrl + '/editGroupProfile/' + group, groupData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function addMemberApi(serverUrl: string, groupData: object) {
    try {
        const response = await axios.post(serverUrl + '/addMember', groupData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function createGroup(serverUrl: string, groupData: { groupName: string; description: string; members: string[]; }) {
    try {
        const response = await axios.post(serverUrl + '/createGroup', groupData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function updateGroup(serverUrl: string, group: string, groupData: object) {
    try {
        const response = await axios.put(serverUrl + '/updateGroup/' + group, groupData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response;
    } catch (error) {
        HandleApiError(error)
    }
}
