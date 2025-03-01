import axios from "axios";

export async function getNotification(serverUrl: string) {
    const response = await axios.get(serverUrl + '/getNotifications', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    }) 
    return response.data
}