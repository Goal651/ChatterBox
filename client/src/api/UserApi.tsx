import axios from "axios"
import { User } from "../interfaces/interfaces";
import { serverUrl } from "../constants/constant";

export async function signupApi( userData: object) {
    const response = await axios.post(serverUrl + '/signup', userData);
    return response.data;
}


export async function getUserByEmailApi( email: string) {
    const response = await axios.get(serverUrl + '/getUser/' + email, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function getProfileApi() {
    const response = await axios.get(serverUrl + '/getUserProfile', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    const data = response.data
    const user: User | null = data.user
    return user

}

export async function getUsersApi() {
    const response = await axios.get(serverUrl + '/getUsers', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    const data = response.data
    const users: User[]  = data.users
    return users
}

export async function editUserProfileApi(profileData: object) {
    const response = await axios.put(serverUrl + '/editUserProfile', profileData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function updateUserApi(userData: object) {
    const response = await axios.put(serverUrl + '/editUser/', userData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}




export async function editUserProfilePicture( finalFileName: string) {
    const response = await axios.put(serverUrl + '/editUserProfilePicture', { finalFileName }, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        },
    });
    return response;
}
