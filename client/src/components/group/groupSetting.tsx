import { Group } from "@/types/interfaces";
import { FaTimes, } from "react-icons/fa";


export default function GroupSetting({ closeSetting, group }: { closeSetting: () => void, group: Group }) {
    console.log(group)
    return (
        <div className='flex flex-col items-center justify-center p-20 bg-[#181818] w-full h-full relative'>
            <div className='absolute top-2 left-2 btn btn-square rounded-full text-white bg-black'
                onClick={() => closeSetting()}>
                <FaTimes />
            </div>
            <div className="p-6 bg-[#070707] min-w-2xl rounded-lg shadow-lg  mt-8 text-gray-200">
                <h2 className="text-2xl font-bold mb-2">{group.groupName}</h2>
                <p className="mb-4 text-gray-400">{group.description}</p>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-1">Group Members</h3>
                    <ul className="divide-y divide-gray-700">
                        {group.members.map((member, idx) => (
                            <li key={idx} className="py-2 flex justify-between items-center">
                                <span>{member.member.username}</span>
                                <span className={`px-2 py-1 rounded text-xs ${member.role === "admin" ? "bg-blue-600" : "bg-gray-700"}`}>
                                    {member.role}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mb-2">
                    <h3 className="text-lg font-semibold mb-1">Group Settings</h3>
                    <ul className="space-y-2">
                        <li>
                            <button className="w-full text-left px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">
                                Change Group Name
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">
                                Add Member
                            </button>
                        </li>
                        <li>
                            <button className="w-full text-left px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition">
                                Leave Group
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}