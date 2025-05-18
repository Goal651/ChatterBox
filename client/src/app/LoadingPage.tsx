export default function LoadingPage() {
    return (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center h-screen w-screen bg-[#181818]">
            <div className="flex flex-col items-center">
                <div
                    className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500 border-opacity-75"
                    aria-label="Loading spinner"
                />
                <p className="text-gray-300 mt-6 text-lg font-semibold">Loading, please wait...</p>
            </div>
        </div>
    );
};
