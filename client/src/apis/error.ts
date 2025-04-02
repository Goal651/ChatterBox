import axios from "axios";
import { NavigateFunction } from "react-router-dom";

export function HandleApiError(error: unknown, navigate: NavigateFunction): undefined {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            navigate("/no-internet");
            return undefined;
        }
        // Propagate the error for custom handling by the caller
        throw error;
    }
    console.error("Unexpected error:", error);
    throw error; // Allow caller to handle unexpected errors
}