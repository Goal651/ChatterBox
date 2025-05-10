import axios from "axios";
import { serverUrl } from "../constants/constant";
import { GlobalApiErrorHandler } from "../error/ApiError";


export async function getGroupMessagesApi(group: string) {
    try {
        const response = await axios.get(serverUrl + '/groupMessage/' + group, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}

export async function getMessagesApi(receiverId: string, phase: number) {
    try {
        const response = await axios.get(serverUrl + '/message/' + receiverId + '/' + phase, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}
