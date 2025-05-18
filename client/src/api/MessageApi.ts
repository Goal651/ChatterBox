import axios from "axios";
import { serverUrl } from "../constants/constant";
import { GlobalApiErrorHandler } from "../error/ApiError";
import { Message } from "../interfaces/interfaces";


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
