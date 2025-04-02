import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { HandleApiError } from "./error";
import { fileHeaders } from "./utils";

export async function uploadFileApi(serverUrl: string, fileData: FormData, navigate: NavigateFunction): Promise<any | undefined> {
    try {
        const response = await axios.post(`${serverUrl}/uploadFile`, fileData, fileHeaders());
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
    }
}

export async function getFile(serverUrl: string, fileName: string, navigate: NavigateFunction): Promise<any | undefined> {
    try {
        const response = await axios.get(`${serverUrl}/getFile/${fileName}`, fileHeaders());
        return response.data;
    } catch (error) {
        HandleApiError(error, navigate);
    }
}