import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = ({ serverUrl }: { serverUrl: string }) => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("Verifying...");

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get("token");
            if (!token) {
                setStatus("Invalid verification link");
                return;
            }
            try {
                const response = await axios.get(serverUrl + `/verify-email?token=${token}`);
                setStatus(response.data.message);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setStatus(error.response?.data?.error || "Verification failed");
                }
            }
        };
        verifyEmail();
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-xl font-semibold">Email Verification</h2>
                <p className="mt-2 text-gray-600">{status}</p>
            </div>
        </div>
    );
};

export default VerifyEmail;
