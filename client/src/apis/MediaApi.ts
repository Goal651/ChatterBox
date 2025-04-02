import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { HandleApiError } from "./UserApi";

export async function uploadFileApi(
    serverUrl: string,
    file: File,
    navigate: NavigateFunction
): Promise<{ fileName: string; url: string } | undefined> {
    try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post(`${serverUrl}/uploadFile`, formData, {
            headers: { accesstoken: token, "Content-Type": "multipart/form-data" },
        });
        return response.data; // Assuming { fileName, url }
    } catch (error) {
        HandleApiError(error, navigate);
    }
}

export async function getFileApi(
    serverUrl: string,
    fileName: string,
    navigate: NavigateFunction
): Promise<Blob | undefined> {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${serverUrl}/getFile/${fileName}`, {
            headers: { accesstoken: token },
            responseType: "blob",
        });
        return response.data; // Blob for file download
    } catch (error) {
        HandleApiError(error, navigate);
    }
}