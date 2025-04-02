import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { Message, GroupMessage } from "../interfaces/interfaces";
import { HandleApiError } from "./UserApi";

export async function getMessagesApi(
    serverUrl: string,
    receiverId: string,
    phase: number,
    navigate: NavigateFunction
): Promise<{ messages: Message[] }> { // Matches original Messages.tsx expectation
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverUrl}/message/${receiverId}/${phase}`, {
            headers: { accesstoken: token },
        });
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
        throw error;
    }
}

export async function getGroupMessagesApi(
    serverUrl: string,
    groupId: string,
    navigate: NavigateFunction
): Promise<{ messages: GroupMessage[] }> { // Matches original Messages.tsx expectation
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverUrl}/gmessage/${groupId}`, {
            headers: { accesstoken: token },
        });
        return response.data;
    } catch (error) {
        HandleApiError(error,navigate);
        throw error;
    }
}