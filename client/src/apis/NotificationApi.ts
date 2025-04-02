import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { Notification } from "../interfaces/interfaces";
import { HandleApiError } from "./UserApi";

export async function getNotification(
    serverUrl: string,
    navigate: NavigateFunction
): Promise<{ notifications: Notification[] } | undefined> {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverUrl}/getNotifications`, {
            headers: { accesstoken: token },
        });
        return response.data; // Assuming { notifications: Notification[] }
    } catch (error) {
        HandleApiError(error, navigate);
    }
}