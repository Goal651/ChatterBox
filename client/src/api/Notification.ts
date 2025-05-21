import { serverUrl } from "@/constants/constant";
import { GlobalApiErrorHandler } from "@/error/ApiError";
import axios from "axios";

export async function getNotifications() {
    try {
        const response = await axios.get(`${serverUrl}/getNotifications`, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            }
        })
        return response.data.notifications as Notification[] | []

    } catch (error) {
        GlobalApiErrorHandler(error)
    }
}