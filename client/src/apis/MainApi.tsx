import axios from "axios";
import { HandleApiError } from "./error";

// Pinging server
export async function pingServerApi(serverUrl: string) {
    try {
        const response = await axios.get(serverUrl + '/ping');
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function subscribeToPush(serverUrl: string, subscription: object) {
    try {
        const response = await axios.post(serverUrl + '/webPusher/subscribe', subscription, {
            headers: {
                accesstoken: localStorage.getItem('token')
            },
        });
        return response
    } catch (error) {
        HandleApiError(error)

    }
}