import { FaBan, FaBell, FaSliders } from "react-icons/fa6";
import { FaLock, FaTrashAlt, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SettingNavigation() {
    return (
        <div className="flex flex-col gap-y-4 overflow-auto scroll-smooth z-5">

            {/* Section: Your Account */}
            <div className="flex flex-col gap-y-4">
                <div className="text-sm font-semibold text-gray-300">Your Account</div>
                <div className="flex flex-col gap-y-1">
                    <SettingItem navigate="/settings/profile" icon={<FaUserCircle />} label="Profile" />
                    <SettingItem navigate="/settings/preferences" icon={<FaSliders />} label="Preferences" />
                    <SettingItem navigate="/settings/notifications" icon={<FaBell />} label="Notifications" />
                </div>
            </div>

            {/* Section: Privacy */}
            <div className="flex flex-col gap-y-4">
                <div className="text-sm font-semibold text-gray-300">Privacy</div>
                <div className="flex flex-col gap-y-1">
                    <SettingItem navigate="/settings/blocklist" icon={<FaBan />} label="Blocked Users" />
                    <SettingItem navigate="/settings/two-factor" icon={<FaLock />} label="Two-Factor Auth" />
                    <SettingItem navigate="/settings/read-receipt" icon={<FaEyeSlash />} label="Read Receipts" />
                </div>
            </div>

            {/* Section: Account Deletion */}
            <div className="flex flex-col gap-y-4">
                <div className="text-sm font-semibold text-gray-300">Account</div>
                <div className="flex flex-col gap-y-1">
                    <SettingItem navigate="/settings/dangerzone" icon={<FaTrashAlt />} label="Delete Account" />
                </div>
            </div>

        </div>
    );
}

function SettingItem({ icon, label, navigate }: { icon: React.ReactNode, label: string, navigate: string }) {
    const router=useNavigate()

    return (
        <div className="flex items-center bg-[#252525] px-4 py-2 gap-x-2 rounded-lg cursor-pointer hover:bg-[#333333] text-white"
            onClick={() => router(navigate)}>
            <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
            <span>{label}</span>
        </div>
    );
}
