import { FaUserSlash } from "react-icons/fa6";

export function SettingsBlocklist() {
    return (
        <div className="flex flex-col gap-y-4 w-full h-full">
            <div className="text-xl font-bold">Blocked Users</div>

            <div className="flex flex-col gap-y-3">
                {["user123", "annoying_user", "spammer99"].map((user, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#1f1f1f] px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-x-2">
                            <FaUserSlash className="text-red-500" />
                            <span className="text-white">{user}</span>
                        </div>
                        <button className="btn btn-sm bg-red-700 text-white rounded-lg">Unblock</button>
                    </div>
                ))}
            </div>
        </div>
    );
}