import React from 'react';

const LoadingPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-800">
            <div className="flex flex-col items-center">
                
                <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500 border-opacity-75"></div>

                <p className="text-gray-500 mt-6 text-lg font-semibold">Loading, please wait...</p>
            </div>
        </div>
    );
};

export default LoadingPage;
