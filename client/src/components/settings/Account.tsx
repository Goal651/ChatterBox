import { FaUpload } from "react-icons/fa6";
import ProfilePicturePreview from "@/components/common/ProfilePicturePreview";
import { useState } from "react";
import { User } from "@/types/interfaces";

export default function SettingsAccount() {
       const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('authenticatedUser');
        return storedUser ? JSON.parse(storedUser) : null;
    })
    

    return (
        <div className="flex flex-col gap-y-10 w-full h-full ">
            {/* Header */}
            <div className="text-2xl font-bold text-center">Account</div>

            {/* Profile Picture Section */}
            <div className="flex items-center gap-x-4">
                <div className="btn btn-square rounded-full bg-black w-20 h-20">
                    <ProfilePicturePreview username="username" textSize="5xl" />
                </div>
                <div className="flex flex-col gap-y-2">
                    <div className="font-semibold">Profile Picture</div>
                    <div className="flex flex-row gap-x-2">
                        <label className="btn btn-sm rounded-lg text-xs cursor-pointer">
                            <FaUpload />
                            <input type="file" accept="image/*" className="hidden" />
                            <span>Upload Image</span>
                        </label>
                        <button className="btn btn-sm rounded-lg">Remove</button>
                    </div>
                    <div className="text-xs text-gray-400">Supported: JPG, PNG, GIF under 5MB</div>
                </div>
            </div>

            {/* Account Info Section */}
            <div className="flex flex-col gap-y-5">
                <div className="flex flex-row gap-x-10">
                    <div className="flex flex-col gap-y-2">
                        <label htmlFor="username" className="label text-sm">Username</label>
                        <input
                            id="username"
                            className="input input-sm bg-[#252525] rounded-lg"
                            type="text"
                            placeholder="YourUsername"
                            value={user?.username}
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <label htmlFor="email" className="label text-sm">Email</label>
                        <input
                            id="email"
                            className="input input-sm bg-[#252525] rounded-lg"
                            type="email"
                            placeholder="mail@site.com"
                            value={user?.email}
                        />
                        <span className="text-xs text-gray-400">
                            Email change requires verification.
                        </span>
                    </div>
                </div>

                {/* Optional Section (Password Change) */}
                <div className="flex flex-row gap-x-10">
                    <div className="flex flex-col gap-y-2">
                        <label htmlFor="current-password" className="label text-sm">Current Password</label>
                        <input
                            id="current-password"
                            className="input input-sm bg-[#252525] rounded-lg"
                            type="password"
                            placeholder="********"
                        />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <label htmlFor="new-password" className="label text-sm">New Password</label>
                        <input
                            id="new-password"
                            className="input input-sm bg-[#252525] rounded-lg"
                            type="password"
                            placeholder="New password"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end">
                <div className="flex flex-row gap-x-4">
                    <button className="btn text-white bg-green-800 rounded-lg">Save</button>
                    <button className="btn text-white bg-red-800 rounded-lg">Cancel</button>
                </div>
            </div>
        </div>
    );
}
