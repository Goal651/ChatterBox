import axios from "axios"
import { serverUrl } from "../constants/constant"
import { GlobalApiErrorHandler } from "@/error/ApiError"
import { notify } from "@/utils/NotificationService"

export async function createGroupApi(groupData: object) {
    try {
        const response = await axios.post(serverUrl + '/createGroup', groupData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        })
        localStorage.setItem('group', response.data.group)
        notify('Group created successfully', 'success')
    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}

export async function getGroupsApi() {
    const response = await axios.get(serverUrl + '/getGroups', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    })
    localStorage.setItem('groups', JSON.stringify(response.data.groups))
}

export async function getGroupByNameApi(name: string) {
    const response = await axios.get(serverUrl + '/getGroup/' + name, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    })
    return response.data
}

export async function editGroupProfileApi(group: string, groupData: object) {
    const response = await axios.put(serverUrl + '/editGroupProfile/' + group, groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    })
    return response.data
}

export async function addMemberApi(groupData: object) {
    const response = await axios.post(serverUrl + '/addMember', groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    })
    return response.data
}

export async function createGroup(groupData: {
    groupName: string
    description: string
    members: string[]
}) {
    try {
        const response = await axios.post(serverUrl + '/createGroup', groupData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        })
        if (response.data.isError) {
            notify(response.data.message, 'error')
        }else notify('Group created successfully','success')
    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}

export async function updateGroup(group: string, groupData: object) {
    const response = await axios.put(serverUrl + '/updateGroup/' + group, groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    })
    return response
}
