import React, { useEffect, useState } from 'react';
import { Group, User } from '../../interfaces/interfaces';
import { useParams } from 'react-router-dom';
import { updateGroup } from '../../api/GroupApi';

interface GroupMembers {
    member: User,
    role: string
}

export default function GroupSetting({ groups, users, serverUrl }: { groups: Group[]; users: User[]; serverUrl: string }) {
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [members, setMembers] = useState<GroupMembers[]>([]);
    const [newMembers, setNewMembers] = useState<User[]>([]);
    const { componentId } = useParams() as { componentId: string };

    useEffect(() => {
        if (groups) {
            const selectedGroup = groups.find(group => group._id === componentId);
            if (selectedGroup) {
                setGroupName(selectedGroup.groupName);
                setDescription(selectedGroup.description);
                setMembers(selectedGroup.members);
            }
        }
    }, [componentId, groups]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleMemberToggle = (user: User) => {
        if (newMembers.some(member => member._id === user._id)) {
            setNewMembers(newMembers.filter(member => member._id !== user._id)); // Remove member
        } else {
            setNewMembers([...newMembers, user]); // Add member
        }
    };

    const handleRemoveMember = (user: User) => {
        setMembers(members.filter(member => member.member._id !== user._id)); // Remove from existing members
    };

    const availableUsers = users.filter(user =>
        !members.some(member => member.member._id === user._id) &&
        !newMembers.some(newMember => newMember._id === user._id) // Only show users who are neither in members nor newMembers
    );

    const handleSavingChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newMembersIds = newMembers.map(user => user._id);
            const response = await updateGroup(serverUrl, componentId, { groupName, description, members: newMembersIds });
            if (response.status === 200) {
                const newMember = [...members, ...newMembers.map(user => ({ member: user, role: 'member' }))];
                setMembers(newMember); // Update members state
                setNewMembers([]); // Clear new members
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='flex items-center justify-center h-full'>
            <div className="flex flex-col bg-slate-800  rounded-xl w-full max-w-lg mx-auto items-center gap-y-4 p-10">
                <h2 className="text-2xl font-bold text-center text-slate-300">Group Settings</h2>

                <div className="space-y-4">
                    <label className="block">
                        <span className="label text-gray-700 font-medium">Group Name</span>
                        <input type="text" value={groupName} onChange={handleNameChange} className="mt-2 p-3 w-full rounded-lg border border-gray-300" />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 font-medium">Description</span>
                        <textarea value={description} onChange={handleDescriptionChange} className="mt-2 p-3 w-full rounded-lg border border-gray-300" />
                    </label>
                </div>

                <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                    <h4 className="text-white font-medium">Existing Members:</h4>
                    <ul className="space-y-2">
                        {members.map(member => (
                            <li key={member.member._id} className="flex justify-between items-center p-2 bg-gray-700 rounded-lg">
                                <span className="text-white">{member.member.username} ({member.member.email})</span>
                                <button onClick={() => handleRemoveMember(member.member)} className="text-red-500 hover:text-red-600">Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                    <h4 className="text-white font-medium">Manage Members:</h4>
                    <div className='flex flex-col gap-y-4'>
                        <ul className="space-y-2">
                            {availableUsers.length > 0 && (
                                availableUsers.map(user => (
                                    <li
                                        key={user._id}
                                        className={`cursor-pointer p-2 rounded-lg text-white ${newMembers.some(member => member._id === user._id) ? 'bg-green-700' : 'bg-gray-700'} hover:bg-gray-600`}
                                        onClick={() => handleMemberToggle(user)}
                                    >
                                        {user.username} ({user.email})
                                    </li>
                                ))
                            )}
                        </ul>

                        {newMembers.length > 0 && (
                            <div className="">
                                <ul className="space-y-2">
                                    {newMembers.map(user => (
                                        <li key={user._id}
                                            onClick={() => handleMemberToggle(user)}
                                            className={`cursor-pointer p-2 rounded-lg text-white ${newMembers.some(member => member._id === user._id) ? 'bg-green-700' : 'bg-gray-700'} hover:bg-green-600`}
                                        >
                                            {user.username} ({user.email})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center mt-6">
                    <button onClick={handleSavingChanges} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
}
