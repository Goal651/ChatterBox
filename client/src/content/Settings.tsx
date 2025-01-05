import * as iconsFa from "react-icons/fa";

export default function Setting() {
    return (
        <div className="w-full flex flex-col items-center p-6 space-y-6 bg-black h-full rounded-2xl overflow-y-auto overflow-x-hidden">
            <h1 className="text-2xl font-bold text-gray-500">Settings</h1>

            {/* Profile Settings */}
            <div className="w-full max-w-md bg-slate-800 p-4 rounded-lg shadow-md">
                <div className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <iconsFa.FaUser className="mr-2 text-blue-500" />
                    Profile Settings
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="block text-gray-600 text-sm mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900"
                        />
                    </div>
                </div>
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Save Changes
                </button>
            </div>

            {/* Account Settings */}
            <div className="w-full max-w-md bg-slate-800 p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <iconsFa.FaLock className="mr-2 text-green-500" />
                    Account Settings
                </h2>
                <div className="space-y-3">
                    <div>
                        <label className="block text-gray-600 text-sm mb-1">Change Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-200 text-sm mb-1">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full border-0 px-3 py-2 rounded-md text-gray-200 bg-slate-900"
                        />
                    </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    Update Password
                </button>
            </div>

            {/* Notification Settings */}
            <div className="w-full max-w-md bg-slate-800 p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <iconsFa.FaBell className="mr-2 text-yellow-500" />
                    Notification Settings
                </h2>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="emailNotifications"
                            className="mr-2"
                        />
                        <label htmlFor="emailNotifications" className="text-gray-600">
                            Email Notifications
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="smsNotifications"
                            className="mr-2 "
                        />
                        <label htmlFor="smsNotifications" className="text-gray-600">
                            SMS Notifications
                        </label>
                    </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                    Save Preferences
                </button>
            </div>
        </div>
    );
}
