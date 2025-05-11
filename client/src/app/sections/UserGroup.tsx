import { useState } from "react"
import SearchInput from "../../components/shared/inputs/SearchInput"
import UserGroupList from "../../components/common/UserGroupList"
import MainStorage from "../../data/Storage"
import { FaUser, FaUserGroup } from "react-icons/fa6"

export default function UserGroup() {
    const [searchTerm, setSearchTerm] = useState("")
    const [tab, setTab] = useState<'users' | 'groups'>('users')
    const users = MainStorage().loadedUsers
    const groups = MainStorage().loadedGroups

    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm))
    const filteredGroups = groups.filter(group => group.groupName.toLowerCase().includes(searchTerm))
    return (
        <div className={`flex flex-col p-2 w-2xl h-screen gap-y-5`}>
            <SearchInput
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex gap-x-4 items-center justify-center">
                <div className="btn btn-square bg-[#252525] border-0 rounded-lg text-gray-200 font-bold shadow "
                    onClick={() => setTab('users')}>
                    <FaUser />
                </div>
                <div className="btn btn-square bg-[#252525] border-0 rounded-lg text-gray-200 font-bold shadow "
                    onClick={() => setTab('groups')}>
                    <FaUserGroup />
                </div>
            </div>

            <UserGroupList
                users={filteredUsers}
                groups={filteredGroups}
                tab={tab}
            />
        </div>
    )
}