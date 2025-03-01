import axios from "axios"
import { User } from "../interfaces/interfaces";

export async function signupApi(serverUrl: string, userData: object) {
    const response = await axios.post(serverUrl + '/signup', userData);
    return response.data;
}


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
    const users: User[]  = data.users
    return users
}

export async function editUserProfileApi(serverUrl: string, profileData: object) {
    const response = await axios.put(serverUrl + '/editUserProfile', profileData, {
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




export async function editUserProfilePicture(serverUrl: string, finalFileName: string) {
    const response = await axios.put(serverUrl + '/editUserProfilePicture', { finalFileName }, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        },
    });
    return response;
}
