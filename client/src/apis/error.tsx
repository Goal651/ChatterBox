import axios from "axios";
import { useNavigate } from "react-router-dom";

export function HandleApiError(error: unknown) {

    const navigate = useNavigate()


    if (axios.isAxiosError(error)) {
        if (!error.response) {
            navigate('/noInternet')
            return
        }
    }

}












