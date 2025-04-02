import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { Group } from "../interfaces/interfaces";
import { HandleApiError } from "./UserApi";

export async function getGroups(serverUrl: string, navigate: NavigateFunction): Promise<Group[] | undefined> {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverUrl}/getGroups`, {
            headers: { accesstoken: token },
        });
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
    }
}

export async function createGroupApi(
    serverUrl: string,
    groupData: { groupName: string; description: string; members: string[] },
    navigate: NavigateFunction
): Promise<{ status: number; data: { groupId: string } }> { // Matches original CreateGroup.tsx expectation
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${serverUrl}/createGroup`, groupData, {
            headers: { accesstoken: token, "Content-Type": "application/json" },
        });
        return response; // Returns full response object
    } catch (error) {
        HandleApiError(error, navigate);
        throw error; // Ensure error propagates
    }
}