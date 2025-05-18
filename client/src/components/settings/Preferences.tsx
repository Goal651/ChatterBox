import { FaMoon, FaLanguage, FaPalette } from "react-icons/fa6";

export default function SettingsPreferences() {
    return (
        <div className="flex flex-col gap-y-4 w-full h-full">
            <div className="text-xl font-bold">Preferences</div>

            <div className="flex flex-col gap-y-6">
                <div className="flex items-center gap-x-4">
                    <FaMoon className="w-6 h-6" />
                    <div className="flex flex-col gap-y-1">
                        <div className="font-semibold">Theme</div>
                        <select className="select select-sm bg-[#252525] text-white rounded-lg w-40">
                            <option>System Default</option>
                            <option>Light</option>
                            <option>Dark</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-x-4">
                    <FaLanguage className="w-6 h-6" />
                    <div className="flex flex-col gap-y-1">
                        <div className="font-semibold">Language</div>
                        <select className="select select-sm bg-[#252525] text-white rounded-lg w-40">
                            <option>English</option>
                            <option>French</option>
                            <option>Spanish</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-x-4">
                    <FaPalette className="w-6 h-6" />
                    <div className="flex flex-col gap-y-1">
                        <div className="font-semibold">Accent Color</div>
                        <div className="flex gap-x-2">
                            <div className="w-6 h-6 bg-red-500 rounded-full cursor-pointer" />
                            <div className="w-6 h-6 bg-blue-500 rounded-full cursor-pointer" />
                            <div className="w-6 h-6 bg-green-500 rounded-full cursor-pointer" />
                            <div className="w-6 h-6 bg-yellow-500 rounded-full cursor-pointer" />
                        </div>
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
