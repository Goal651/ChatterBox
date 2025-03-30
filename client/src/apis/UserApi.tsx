import axios from "axios"
import { User } from "../interfaces/interfaces";
import { HandleApiError } from "./error";

export async function signupApi(serverUrl: string, userData: object) {
    try {
        const response = await axios.post(serverUrl + '/signup', userData);
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function getUserByEmailApi(serverUrl: string, email: string) {
    try {
        const response = await axios.get(serverUrl + '/getUser/' + email, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function getProfileApi(serverUrl: string) {
    try {
        const response = await axios.get(serverUrl + '/getUserProfile', {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        const data = response.data
        const user: User | null = data.user
        return user
    } catch (error) {
        HandleApiError(error)
    }
}

export async function getUsersApi(serverUrl: string) {
    try {
        const response = await axios.get(serverUrl + '/getUsers', {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        const data = response.data
        const users: User[] = data.users
        return users
    } catch (error) {
        HandleApiError(error)
    }
}

export async function editUserProfileApi(serverUrl: string, profileData: object) {
    try {
        const response = await axios.put(serverUrl + '/editUserProfile', profileData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function updateUserApi(serverUrl: string, userData: object) {
    try {
        const response = await axios.put(serverUrl + '/editUser/', userData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}




export async function editUserProfilePicture(serverUrl: string, finalFileName: string) {
    try {
        const response = await axios.put(serverUrl + '/editUserProfilePicture', { finalFileName }, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            },
        });
        return response;
    } catch (error) {
        HandleApiError(error)
    }
}
