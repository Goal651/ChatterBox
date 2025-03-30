import axios from "axios"
import { HandleApiError } from "./error";


export async function checkTokenApi(serverUrl: string) {
    try {
        const response = await axios.get(serverUrl + '/auth', {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function loginApi(serverUrl: string, email: string, password: string) {
    try {
        const response = await axios.post(serverUrl + '/login', { email, password });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}


export async function editUserPassword(serverUrl: string, userData: object) {
    try {
        const response = await axios.put(serverUrl + '/editUserPassword', userData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}