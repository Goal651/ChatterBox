import axios from "axios"
import { serverUrl } from "../constants/constant";
import { GlobalApiErrorHandler } from "../error/ApiError";


export async function getUserByEmailApi(email: string) {
    try {
        const response = await axios.get(serverUrl + '/getUser/' + email, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}

export async function getProfileApi() {
    try {
        const response = await axios.get(serverUrl + '/getProfile', {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error)
    }

}

export async function getUsersApi() {
    try {
        const response = await axios.get(serverUrl + '/getUsers', {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        })
        localStorage.setItem('users', JSON.stringify(response.data.users))
    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}


export async function editUserProfileApi(profileData: object) {
    try {
        const response = await axios.put(serverUrl + '/editUserProfile', profileData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}

export async function updateUserApi(userData: object) {
    try {
        const response = await axios.put(serverUrl + '/updateUser', userData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response;
    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}




export async function editUserProfilePicture(finalFileName: string) {
    try {
        const response = await axios.put(serverUrl + '/editUserProfilePicture', { finalFileName }, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}
