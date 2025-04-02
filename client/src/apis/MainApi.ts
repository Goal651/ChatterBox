import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { HandleApiError } from "./UserApi";

export async function pingServerApi(serverUrl: string, navigate: NavigateFunction): Promise<unknown | undefined> {
    try {
        const response = await axios.get(`${serverUrl}/ping`);
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
    }
}

export async function webPusherSubscribeApi(
    serverUrl: string,
    subscriptionData: { userId: string; endpoint: string; keys: { p256dh: string; auth: string } },
    navigate: NavigateFunction
): Promise<{ message: string } | undefined> {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${serverUrl}/webPusher/subscribe`, subscriptionData, {
            headers: { accesstoken: token, "Content-Type": "application/json" },
        });
        return response.data; // Assuming { message }
    } catch (error) {
        HandleApiError(error, navigate);
    }
}