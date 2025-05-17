import axios from "axios";
import { notify } from "../utils/NotificationService";


export function GlobalApiErrorHandler(error: unknown) {
    const isAxiosError = axios.isAxiosError(error);
    const isNormalError = error instanceof Error;

    if (isAxiosError) {
        if (!error.response) {
            console.error("Network error: No internet connection.");
            notify("Network error: No internet connection.", "error")
            return
        }

        if (error.response.status === 401) {
            console.error("Authentication error. Please log in again.");
            notify("Authentication error. Please log in again.", "error")
            localStorage.clear()
            window.location.href = '/login'
            return
        }

        if (error.response.status === 500) {
            console.error(error.response.data.message);
            notify(error.response.data.message, "error")
            return
        }

    } else if (isNormalError) {
        console.error("Unexpected error:", error);
        notify("Unexpected error: " + error.message, "error")
    }

}