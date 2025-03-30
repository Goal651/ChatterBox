import axios from "axios";
import { HandleApiError } from "./error";


export async function getGroupMessagesApi(serverUrl: string, group: string) {
    try {
        const response = await axios.get(serverUrl + '/gmessage/' + group, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function getMessagesApi(serverUrl: string, receiverId: string, phase: number) {
    try {
        const response = await axios.get(serverUrl + '/message/' + receiverId + '/' + phase, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}
