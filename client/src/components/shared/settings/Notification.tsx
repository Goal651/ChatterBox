import { FaMobileAlt } from "react-icons/fa";
import { FaBell, FaEnvelope,} from "react-icons/fa6";

export function SettingsNotifications() {
    return (
        <div className="flex flex-col gap-y-4 w-full h-full">
            <div className="text-xl font-bold">Notifications</div>

            <div className="flex flex-col gap-y-6">
                <div className="flex items-center gap-x-4">
                    <FaBell className="w-6 h-6" />
                    <div className="flex flex-col gap-y-1">
                        <div className="font-semibold">Push Notifications</div>
                        <input type="checkbox" className="toggle toggle-success" />
                    </div>
                </div>

                <div className="flex items-center gap-x-4">
                    <FaEnvelope className="w-6 h-6" />
                    <div className="flex flex-col gap-y-1">
                        <div className="font-semibold">Email Alerts</div>
                        <input type="checkbox" className="toggle toggle-success" />
                    </div>
                </div>

                <div className="flex items-center gap-x-4">
                    <FaMobileAlt className="w-6 h-6" />
                    <div className="flex flex-col gap-y-1">
                        <div className="font-semibold">SMS Notifications</div>
                        <input type="checkbox" className="toggle toggle-success" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-8">
                <div className="flex flex-row gap-x-4">
                    <button className="btn text-white bg-green-800 rounded-lg">Save</button>
                    <button className="btn text-white bg-red-800 rounded-lg">Cancel</button>
                </div>
            </div>
        </div>
    );
}