import { FaBan, FaBell, FaSliders } from "react-icons/fa6";
import { FaLock, FaTrashAlt, FaEyeSlash, FaUserCircle } from "react-icons/fa";

export default function SettingNavigation() {
    return (
        <div className="flex flex-col gap-y-4 overflow-auto scroll-smooth">

            {/* Section: Your Account */}
            <div className="flex flex-col gap-y-4">
                <div className="text-sm font-semibold text-gray-300">Your Account</div>
                <div className="flex flex-col gap-y-1">
                    <SettingItem icon={<FaUserCircle />} label="Profile" />
                    <SettingItem icon={<FaSliders />} label="Preferences" />
                    <SettingItem icon={<FaBell />} label="Notifications" />
                </div>
            </div>

            {/* Section: Privacy */}
            <div className="flex flex-col gap-y-4">
                <div className="text-sm font-semibold text-gray-300">Privacy</div>
                <div className="flex flex-col gap-y-1">
                    <SettingItem icon={<FaBan />} label="Blocked Users" />
                    <SettingItem icon={<FaLock />} label="Two-Factor Auth" />
                    <SettingItem icon={<FaEyeSlash />} label="Read Receipts" />
                </div>
            </div>

            {/* Section: Account Deletion */}
            <div className="flex flex-col gap-y-4">
                <div className="text-sm font-semibold text-gray-300">Account</div>
                <div className="flex flex-col gap-y-1">
                    <SettingItem icon={<FaTrashAlt />} label="Delete Account" />
                </div>
            </div>

        </div>
    );
}

function SettingItem({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center bg-[#252525] px-4 py-2 gap-x-2 rounded-lg cursor-pointer hover:bg-[#333333] text-white">
            <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
            <span>{label}</span>
        </div>
    );
}
