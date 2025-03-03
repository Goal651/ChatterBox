import * as iconsFa from "react-icons/fa"
import { CreateGroupProps, User } from "../interfaces/interfaces"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { createGroup } from "../api/GroupApi"
import axios from "axios"


export default function CreateGroup({ userList, serverUrl }: CreateGroupProps) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [groupName, setGroupName] = useState("")
    const [groupDescription, setGroupDescription] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedMembers, setSelectedMembers] = useState<User[]>([])
    const [groupNameError, setGroupNameError] = useState(false)

    const checkInputs = () => {
        let hasError = false
        if (!groupName) {
            setGroupNameError(true)
            hasError = true
        } else {
            setGroupNameError(false)
        }
        return !hasError // Return false if there's an error
    }


    const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(e.target.value)
        if (e.target.value.trim()) setGroupNameError(false)
    }

    const handleGroupDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setGroupDescription(e.target.value)
    }

    const toggleMemberSelection = (member: User) => {
        if (selectedMembers.find((m) => m._id === member._id)) setSelectedMembers(selectedMembers.filter((m) => m._id !== member._id))
        else setSelectedMembers([...selectedMembers, member])

    }

    const filteredUserList = userList.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreateGroup = async () => {
        if (!checkInputs()) {
            console.error("error")
            return
        }

        try {
            const groupData = {
                groupName,
                description: groupDescription,
                members: selectedMembers ? selectedMembers.map((member) => member._id) : [],
            }
            if (groupName) {
                setLoading(true)
                const response = await createGroup(serverUrl, groupData)
                if (response.status === 200) {
                    setLoading(false)
                    navigate("/group/" + response.data.groupId)
                }
            }
        } catch (error) {
            setLoading(false)
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    navigate("/no-internet")
                    return
                }
                if (error.response.status === 500) {
                    console.error(error.response.data.message)
                }
            }
        }
    }

    return (
        <div className="w-full flex flex-col items-center p-6 space-y-6 bg-black h-full rounded-2xl overflow-y-auto overflow-x-hidden">
            <h1 className="text-2xl font-bold text-gray-500">Create a New Group</h1>

            {/* Group Details */}
            <div className="w-full max-w-md bg-slate-800 p-4 rounded-lg shadow-md">
                <div className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <iconsFa.FaUsers className="mr-2 text-blue-500" />
                    Group Details
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="block text-gray-600 text-sm mb-1">Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={handleGroupNameChange}
                            placeholder="Enter group name"
                            className={`w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900 ${groupNameError ? "border-red-500" : "border-gray-700"
                                }`}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm mb-1">Group Description</label>
                        <textarea
                            value={groupDescription}
                            onChange={handleGroupDescriptionChange}
                            placeholder="Enter a brief description"
                            rows={3}
                            className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900 border-gray-700"
                        />
                    </div>
                </div>
            </div>

            {/* Add Members */}
            <div className="w-full max-w-md bg-slate-800 p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <iconsFa.FaUserPlus className="mr-2 text-green-500" />
                    Add Members
                </h2>
                <div className="space-y-3">
                    <div>
                        <label className="block text-gray-600 text-sm mb-1">Search Members</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email"
                            className="w-full px-3 py-2 border rounded-md text-gray-200 bg-slate-900 border-gray-700"
                        />
                    </div>
                    <div className="text-sm text-gray-500">Available Members:</div>
                    <div
                        className={`max-h-40 overflow-y-auto space-y-2 border border-gray-700 rounded-md p-2`}
                    >
                        {filteredUserList.map((user) => (
                            <div
                                key={user._id}
                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedMembers.find((m) => m._id === user._id)
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-700 text-gray-300"
                                    }`}
                                onClick={() => toggleMemberSelection(user)}
                            >
                                <span>
                                    {user.username} ({user.email})
                                </span>
                                {selectedMembers.find((m) => m._id === user._id) ? (
                                    <iconsFa.FaCheck />
                                ) : (
                                    <iconsFa.FaPlus />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Group Button */}
            <div className="w-full max-w-md">
                <button
                    onClick={handleCreateGroup}
                    className={`w-full px-4 py-2 rounded-md ${loading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                    disabled={loading}
                >
                    {loading ? "Creating Group..." : "Create Group"}
                </button>
            </div>
        </div>
    )
}
