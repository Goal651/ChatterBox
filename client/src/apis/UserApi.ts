import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { User } from "../interfaces/interfaces";

export function HandleApiError(error: unknown, navigate: NavigateFunction) {
    if (axios.isAxiosError(error) && !error.response) {
        navigate("/no-internet");
    }
    throw error;
}

export async function getUserProfile(serverUrl: string, navigate: NavigateFunction): Promise<User | undefined> {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverUrl}/getUserProfile`, {
            headers: { accesstoken: token },
        });
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
    }
}

export async function getUsers(serverUrl: string, navigate: NavigateFunction): Promise<User[] | undefined> {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverUrl}/getUsers`, {
            headers: { accesstoken: token },
        });
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
    }
}

export async function updateUser(
    serverUrl: string,
    userData: Partial<User>,
    navigate: NavigateFunction
): Promise<User | undefined> {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(`${serverUrl}/editUser/`, userData, {
            headers: { accesstoken: token, "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
    }
}

export async function editUserPassword(
    serverUrl: string,
    passwordData: { oldPassword: string; newPassword: string },
    navigate: NavigateFunction
): Promise<{ message: string } | undefined> {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(`${serverUrl}/editUserPassword`, passwordData, {
            headers: { accesstoken: token, "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
    }
}

export async function uploadFile(serverUrl: string, file: File, typefolder: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${serverUrl}/api/upload`, formData, {
        headers: { 'typefolder': 'messages', 'name': file.name, 'totalchunks': '1', 'currentchunk': '0' },
    });
    return response.data.finalFileName;
}

export async function editUserProfilePictureApi(
    serverUrl: string,
    file: File,
    navigate: NavigateFunction
): Promise<{ imageUrl: string; message: string } | undefined> {
    try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.put(`${serverUrl}/api/editUserProfilePicture`, formData, {
            headers: { accesstoken: token, "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
    }
}