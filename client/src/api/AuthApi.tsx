import axios from "axios"


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


export async function editUserPassword(serverUrl: string, userData: object) {
    const response = await axios.put(serverUrl + '/editUserPassword', userData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}