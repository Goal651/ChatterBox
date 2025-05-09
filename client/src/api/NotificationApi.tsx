import axios from "axios";
import { serverUrl } from "../constants/constant";

export async function getNotification() {
    const response = await axios.get(serverUrl + '/getNotifications', {
        headers: {
            accesstoken: localStorage.getItem('token'),
        }
    }) 
    return response.data
}