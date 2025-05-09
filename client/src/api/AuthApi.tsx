import axios from "axios"
import { serverUrl } from "../constants/constant";


export async function checkTokenApi() {
    const response = await axios.get(serverUrl + '/auth', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response;
}

export async function loginApi( email: string, password: string) {
    const response = await axios.post(serverUrl + '/login', { email, password });
    return response.data;
}


export async function editUserPassword( userData: object) {
    const response = await axios.put(serverUrl + '/editUserPassword', userData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}