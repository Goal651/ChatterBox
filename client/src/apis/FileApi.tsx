import axios from "axios"
import { HandleApiError } from "./error";


// File uploads
export async function uploadFileApi(serverUrl: string, fileData: FormData) {
    try {
        const response = await axios.post(serverUrl + '/uploadFile', fileData, {
            headers: {
                accesstoken: localStorage.getItem('token'),
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        HandleApiError(error)
    }
}

export async function getFile(serverUrl: string, fileName: string) {
    try {
        const response = await axios.get(serverUrl + '/getFile/' + fileName, {
            headers: {
                accesstoken: localStorage.getItem('token'),
            },
        })
        return response.data
    } catch (error) {
        HandleApiError(error)
    }
}
