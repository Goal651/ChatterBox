import axios from "axios"
import { serverUrl } from "../constants/constant";


// File uploads
export async function uploadFileApi(fileData: FormData) {
    const response = await axios.post(serverUrl + '/uploadFile', fileData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
}

export async function getFile(fileName: string) {

    const response = await axios.get(serverUrl + '/getFile/' + fileName, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        },
    })
    return response.data

}
