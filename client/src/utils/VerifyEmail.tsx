import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../constants/constant";

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("Verifying...");

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus("Invalid verification link");
                return;
            }
            try {
                const response = await axios.get(serverUrl + `/verifyEmail/${token}`);
                setStatus(response.data.message);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setStatus(error.response?.data?.error || "Verification failed");
                }
            }
        };
        verifyEmail();
    }, [token]);

    return (
        <div className="flex items-center justify-center h-screen bg-slate-800">
            <div className="px-20 py-10 bg-slate-950 shadow-lg rounded-xl">
                <h2 className="text-2xl font-semibold">Email Verification</h2>
                <p className="text-lg mt-2 text-gray-600">{status}</p>
                <div className="flex items-center justify-center mt-10">
                    <Link to="/login" className="link link-hover text-xl text-center text-blue-500">Back To login</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
