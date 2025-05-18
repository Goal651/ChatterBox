import axios from "axios"
import { serverUrl } from "../constants/constant"
import { GlobalApiErrorHandler } from "../error/ApiError"


export async function checkTokenApi() {
    try {
        const response = await axios.get(serverUrl + '/checkToken', {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        })
        return response.data
    } catch (error) {
        GlobalApiErrorHandler(error)
        return undefined;
    }
}

export async function loginApi(email: string, password: string) {
    try {
        const response = await axios.post(serverUrl + '/login', { email, password })
        return response.data
    } catch (error) {
        GlobalApiErrorHandler(error)
        return undefined;
    }
}

export async function signUpApi(userData: object) {
    try {
        const response = await axios.post(serverUrl + '/signup', userData)
        return response.data
    } catch (error) {
        GlobalApiErrorHandler(error)
        return undefined;
    }
}


export async function editUserPassword(userData: object) {
    try {
        const response = await axios.put(serverUrl + '/editUserPassword', userData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        })
        return response.data
    } catch (error) {
        GlobalApiErrorHandler(error)
        return undefined;
    }
}