import axios from "axios";
import { User } from "../interfaces/interfaces";


// Set up an Axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
    response => response, // Pass through the successful responses
    async error => {
        if (error.response && error.response.status === 401) {
            const newTokenResponse: string = error.response.data.newToken
            const newToken = newTokenResponse;
            localStorage.setItem('token', newToken); // Store the new token
            error.config.headers['accesstoken'] = newToken; // Set the new token in the request headers
            return axios(error.config); // Retry the original request with the new token
        }
        return Promise.reject(error); // Reject if not a 401 error
    }
);


// Authentication
export async function checkTokenApi(serverUrl: string) {
    const response = await axios.get(serverUrl + '/auth', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response;
}

export async function loginApi(serverUrl: string, email: string, password: string) {
    const response = await axios.post(serverUrl + '/login', { email, password });
    return response.data;
}

// Pinging server
export async function pingServerApi(serverUrl: string) {
    const response = await axios.get(serverUrl + '/ping');
    return response.data;
}

// Creation of groups and users
export async function signupApi(serverUrl: string, userData: object) {
    const response = await axios.post(serverUrl + '/signup', userData);
    return response.data;
}

export async function createGroupApi(serverUrl: string, groupData: object) {
    const response = await axios.post(serverUrl + '/create-group', groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

// Getting users and groups
export async function getUserByEmailApi(serverUrl: string, email: string) {
    const response = await axios.get(serverUrl + '/getUser/' + email, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function getProfileApi(serverUrl: string) {
    const response = await axios.get(serverUrl + '/getUserProfile', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    const data = response.data
    const user: User | null = data.user
    return user

}

export async function getUsersApi(serverUrl: string) {
    const response = await axios.get(serverUrl + '/getUsers', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    const data = response.data
    const users: User[] | [] = data.users
    return users
}

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

// Getting messages
export async function getGroupMessagesApi(serverUrl: string, group: string) {
    const response = await axios.get(serverUrl + '/gmessage/' + group, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function getMessagesApi(serverUrl: string, receiverId: string, phase: number) {
    const response = await axios.get(serverUrl + '/message/' + receiverId + '/' + phase, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

// Updating user, groups, and messages
export async function editUserProfileApi(serverUrl: string, profileData: object) {
    const response = await axios.put(serverUrl + '/editUserProfile', profileData, {
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

export async function updateUserApi(serverUrl: string, userData: object) {
    const response = await axios.put(serverUrl + '/editUser/', userData, {
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

// File uploads
export async function uploadFileApi(serverUrl: string, fileData: FormData) {
    const response = await axios.post(serverUrl + '/uploadFile', fileData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
}

export async function getFile(serverUrl: string, fileName: string) {

    const response = await axios.get(serverUrl + '/getFile/' + fileName, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        },
    })
    return response.data
}

export async function createGroup(serverUrl: string, groupData: {
    groupName: string;
    description: string;
    members: string[];
}) {
    const response = await axios.post(serverUrl + '/create-group', groupData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response;

}
