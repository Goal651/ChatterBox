import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import LoadingPage from "../LoadingPage";
import { serverUrl } from "../../constants/constant";

export default function Auth() {
    const savedToken = localStorage.getItem("token");
    const [token, setToken] = useState(savedToken);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const checkAuth = async () => {
            try {
                axios.defaults.headers.common['accesstoken'] = `${token}`;
                const response = await axios.get(serverUrl + '/auth');
                if (response.status === 200) {
                    navigate('/chat');
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    // This ensures that err is an AxiosError
                    if (!err.response) {
                        // No response, probably a network error (no internet)
                        setError("Network error: No internet connection.");
                        navigate('/no-internet');
                    } else {
                        // Handle different HTTP error responses
                        switch (err.response.status) {
                            case 401:
                            case 500:
                                localStorage.removeItem('token');
                                setError("Authentication error. Please log in again.");
                                navigate('/login');
                                break;
                            case 403: {
                                const data = err.response.data;
                                if (data?.token) {
                                    localStorage.setItem('token', data.token);
                                    setToken(data.token); // update token state without triggering an endless loop
                                } else {
                                    setError("Forbidden: Your session has expired.");
                                    navigate('/login');
                                }
                                break;
                            }
                            default:
                                setError(`Unexpected error: ${err.response.status}`);
                                navigate('/login');
                                break;
                        }
                    }
                } else {
                    // Handle any unexpected errors
                    setError("An unexpected error occurred.");
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [token, navigate]);

    return (
        <div>
            {loading && (
                <div className="w-screen h-screen flex justify-center items-center z-50 bg-slate-950">
                    <LoadingPage />
                </div>
            )}
            {error && (
                <div className="error-message text-center mt-4 text-red-600">
                    {error}
                </div>
            )}
        </div>
    );
}
