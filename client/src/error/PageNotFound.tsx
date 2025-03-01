import React from 'react';
import { useNavigate } from 'react-router-dom';

const PageNotFound: React.FC = () => {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
            <h1 className="text-9xl font-bold text-gray-400">404</h1>
            <h2 className="text-4xl font-semibold text-gray-600 mt-4">Page Not Found</h2>
            <p className="text-gray-500 mt-2">
                Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
            <button
                onClick={goToHome}
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
                Go to Home
            </button>
        </div>
    );
};

export default PageNotFound;
