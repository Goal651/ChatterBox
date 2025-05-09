import * as iconsFa from "react-icons/fa";
import { CreateGroupProps, User } from "../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createGroup } from "../api/GroupApi";
import axios from "axios";

export default function CreateGroup({ userList}: CreateGroupProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
    const [groupNameError, setGroupNameError] = useState(false);

    const checkInputs = () => {
        let hasError = false;
        if (!groupName.trim()) {
            setGroupNameError(true);
            hasError = true;
        } else {
            setGroupNameError(false);
        }
        return !hasError;
    };

    const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(e.target.value);
        if (e.target.value.trim()) setGroupNameError(false);
    };

    const handleGroupDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setGroupDescription(e.target.value);
    };

    const toggleMemberSelection = (member: User) => {
        if (selectedMembers.find((m) => m._id === member._id)) {
            setSelectedMembers(selectedMembers.filter((m) => m._id !== member._id));
        } else {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    const filteredUserList = userList.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateGroup = async () => {
        if (!checkInputs()) {
            console.error("Group name is required");
            return;
        }

        try {
            const groupData = {
                groupName,
                description: groupDescription,
                members: selectedMembers.map((member) => member._id),
            };
            setLoading(true);
            const response = await createGroup( groupData);
            if (response.status === 200) {
                navigate("/group/" + response.data.groupId);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    navigate("/no-internet");
                    return;
                }
                if (error.response.status === 500) {
                    console.error(error.response.data.message);
                }
            } else {
                console.error("Unexpected error:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-6 space-y-8 bg-gray-950/95 h-full rounded-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 shadow-inner">
            <h1 className="text-3xl font-bold text-gray-200">Create a New Group</h1>

            {/* Group Details */}
            <div className="w-full max-w-lg bg-gray-900/90 p-6 rounded-xl shadow-md">
                <div className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <iconsFa.FaUsers className="text-blue-500 w-6 h-6" />
                    Group Details
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={handleGroupNameChange}
                            placeholder="Enter group name"
                            className={`w-full px-4 py-2 bg-gray-800/80 text-gray-200 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${groupNameError ? "border-red-500" : "border-gray-700"}`}
                        />
                        {groupNameError && <p className="text-red-400 text-xs mt-1">Group name is required</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Group Description</label>
                        <textarea
                            value={groupDescription}
                            onChange={handleGroupDescriptionChange}
                            placeholder="Enter a brief description"
                            rows={3}
                            className="w-full px-4 py-2 bg-gray-800/80 text-gray-200 border border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Add Members */}
            <div className="w-full max-w-lg bg-gray-900/90 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <iconsFa.FaUserPlus className="text-green-500 w-6 h-6" />
                    Add Members
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Search Members</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email"
                            className="w-full px-4 py-2 bg-gray-800/80 text-gray-200 border border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <div className="text-sm text-gray-400">Available Members:</div>
                    <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-700 rounded-lg p-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                        {filteredUserList.map((user) => (
                            <div
                                key={user._id}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedMembers.find((m) => m._id === user._id) ? "bg-green-600/90 text-white" : "bg-gray-800/80 text-gray-200 hover:bg-gray-700/80"}`}
                                onClick={() => toggleMemberSelection(user)}
                            >
                                <span className="truncate">
                                    {user.username} <span className="text-gray-400">({user.email})</span>
                                </span>
                                {selectedMembers.find((m) => m._id === user._id) ? (
                                    <iconsFa.FaCheck className="w-5 h-5 text-white" />
                                ) : (
                                    <iconsFa.FaPlus className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Group Button */}
            <div className="w-full max-w-lg">
                <button
                    onClick={handleCreateGroup}
                    disabled={loading}
                    className={`w-full px-6 py-3 rounded-lg shadow-md text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                            </svg>
                            Creating Group...
                        </>
                    ) : (
                        "Create Group"
                    )}
                </button>
            </div>
        </div>
    );
}