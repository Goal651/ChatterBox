import { useEffect, useState } from "react"
import SearchInput from "../../components/shared/inputs/SearchInput"
import UserGroupList from "../../components/common/UserGroupList"
import { FaUser, FaUserGroup } from "react-icons/fa6"
import { Group, User } from "../../interfaces/interfaces"

export default function UserGroup({ loading }: { loading: boolean }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [tab, setTab] = useState<'users' | 'groups'>('users')
    const [users, setUsers] = useState<User[]>(localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users') as string) : [])
    const [groups, setGroups] = useState<Group[]>(localStorage.getItem('groups') ? JSON.parse(localStorage.getItem('groups') as string) : [])
    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm))
    const filteredGroups = groups.filter(group => group.groupName.toLowerCase().includes(searchTerm))

    useEffect(() => {
        if (!loading) {
            setUsers(JSON.parse(localStorage.getItem('users') as string))
            setGroups(JSON.parse(localStorage.getItem('groups') as string))
        }
    }, [loading])
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
                loading={loading}
            />
        </div>
    )
}