import axios from "axios";
import { HandleApiError } from "./error";

export async function getNotification(serverUrl: string) {
    try {
        const response = await axios.get(serverUrl + '/getNotifications', {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        })
        return response.data
    } catch (error) {
        HandleApiError(error)
    }
}