import axios from "axios";
import { serverUrl } from "../constants/constant";
import { GlobalApiErrorHandler } from "../error/ApiError";
import { Message } from "../types/interfaces";


export async function getGroupMessagesApi(group: string) {
    try {
        const response = await axios.get(serverUrl + '/gmessage/' + group, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });
        return response.data;
    } catch (error) {
        GlobalApiErrorHandler(error)
        return undefined;
    }
}

export async function getMessagesApi(receiverId: string) {
    try {
        const response = await axios.get(serverUrl + '/message/' + receiverId, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        });

        return response.data as { messages: Message[] | null };
    } catch (error) {
        GlobalApiErrorHandler(error)
        return undefined;
    }
}
