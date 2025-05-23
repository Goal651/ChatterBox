import { Group, User } from "@/types/interfaces";
import { FaTimes, } from "react-icons/fa";
import { FaUser, FaUserGroup } from "react-icons/fa6";
import GroupMember from "./member";
import { useState } from "react";


export default function GroupSetting({ closeSetting, group }: { closeSetting: () => void, group: Group }) {
    const [input, setInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [users, setUsers] = useState<User[] >(() => {
        const storedUser = localStorage.getItem('users')
        return storedUser ? JSON.parse(storedUser) : []
    })

    // Filter users based on input
    const filteredUsers = users.filter(
        (user) =>
            input &&
            user.username.toLowerCase().includes(input.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (username: string) => {
        setInput(username);
        setShowSuggestions(false);
    };
    return (
        <div className='flex flex-col p-5 bg-[#181818] w-full h-full '>
            <div className="btn btn-square rounded-full text-white bg-black ">
                <FaTimes
                    className="w-6 h-6 cursor-pointer"
                    onClick={closeSetting}
                />
            </div>
            <div className="flex w-full items-center justify-center">
                <div className="flex flex-col  gap-y-5 bg-[#070707] w-2xl rounded-lg py-4 px-10  justify-center m-20">
                    <div className="flex flex-col items-center justify-center">
                        <div className="btn btn-square rounded-full text-white bg-black">
                            <FaUserGroup />
                        </div>
                        <div className="font-semibold text-lg ">
                            {group.groupName}
                        </div>
                        <div className="text-sm text-gray-400">
                            {group.description}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center gap-y-6 h-full">
                        <div className="font-semibold">Members</div>

                        <div className="">
                            <div>Add member</div>
                            <div className="flex flex-col gap-y-1">
                                <div className="flex items-center gap-x-2">
                                    <label className="input rounded-xl bg-[#252525] focus-within:outline-none  flex items-center gap-x-2">
                                        <FaUser />
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={input}
                                            onChange={handleInputChange}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                                        />
                                    </label>
                                    <button className="btn  rounded-lg">Add</button>
                                </div>
                                {showSuggestions && filteredUsers.length > 0 && (
                                    <div className="bg-[#252525] rounded-xl mt-1 shadow-lg z-10 absolute w-60 max-h-40 overflow-y-auto border border-gray-700">
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.username}
                                                className="px-4 py-2 cursor-pointer hover:bg-[#333]"
                                                onMouseDown={() => handleSuggestionClick(user.username)}
                                            >
                                                {user.username}
                                            </div>
                                        ))}
                                    </div>
                                )}</div>
                            <div className="text-sm text-gray-400">
                                Add members to the group by entering their username.
                            </div>
                        </div>

                        <div className="flex flex-col gap-y-4  h-96">
                            <div className="font-semibold">Group Members</div>
                            <div className="flex flex-col gap-y-2 overflow-y-scroll">
                                {group.members.map((member, index) => (
                                    <GroupMember member={member} key={index} />
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}