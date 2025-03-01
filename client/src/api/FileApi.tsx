import axios from "axios"


// File uploads
export async function uploadFileApi(serverUrl: string, fileData: FormData) {
    const response = await axios.post(serverUrl + '/uploadFile', fileData, {
        headers: {
            accesstoken: localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
}

export async function getFile(serverUrl: string, fileName: string) {

    const response = await axios.get(serverUrl + '/getFile/' + fileName, {
        headers: {
            accesstoken: localStorage.getItem('token'),
        },
    })
    return response.data

}
