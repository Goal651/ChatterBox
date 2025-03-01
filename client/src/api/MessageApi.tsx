import axios from "axios";


export async function getGroupMessagesApi(serverUrl: string, group: string) {
    const response = await axios.get(serverUrl + '/gmessage/' + group, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}

export async function getMessagesApi(serverUrl: string, receiverId: string, phase: number) {
    const response = await axios.get(serverUrl + '/message/' + receiverId + '/' + phase, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    });
    return response.data;
}
