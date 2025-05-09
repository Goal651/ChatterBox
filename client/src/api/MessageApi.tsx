import axios from "axios";
import { serverUrl } from "../constants/constant";


export async function getGroupMessagesApi( group: string) {
    const response = await axios.get(serverUrl + '/gmessage/' + group, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function getMessagesApi( receiverId: string, phase: number) {
    const response = await axios.get(serverUrl + '/message/' + receiverId + '/' + phase, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}
