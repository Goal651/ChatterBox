import axios from "axios";
import { serverUrl } from "../constants/constant";


axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 401) {
            const newTokenResponse: string = error.response.data.newToken
            const newToken = newTokenResponse;
            localStorage.setItem('token', newToken)
            error.config.headers['accesstoken'] = newToken
            return axios(error.config)
        }
        return Promise.reject(error)
    }
);


// Pinging server
export async function pingServerApi() {
    const response = await axios.get(serverUrl + '/ping');
    return response.data;
}





export async function subscribeToPush(subscription: object) {
    try {
        const response = await axios.post(serverUrl + '/webPusher/subscribe', subscription, {
            headers: {
                accesstoken: localStorage.getItem('token')
            },
        });
        return response
    } catch (error) {
        console.error('Failed to send subscription to the backend:', error);
    }
}
