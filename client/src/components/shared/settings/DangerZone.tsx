import { FaExclamationTriangle } from "react-icons/fa";

export function SettingsDangerZone() {
    return (
        <div className="flex flex-col gap-y-4 w-full h-full">
            <div className="text-xl font-bold">Danger Zone</div>

            <div className="bg-red-900/40 p-4 rounded-lg border border-red-800 flex flex-col gap-y-2">
                <div className="flex items-center gap-x-2">
                    <FaExclamationTriangle className="text-red-500" />
                    <span className="font-semibold text-red-400">Delete Account</span>
                </div>
                <p className="text-sm text-gray-300">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="btn bg-red-800 text-white rounded-lg w-fit self-end">Delete Account</button>
            </div>
        </div>
    );
}
