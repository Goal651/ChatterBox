import { useState } from "react"
import SearchInput from "../../components/shared/inputs/SearchInput"
import UserGroupList from "../../components/shared/UserGroupList"
import MainStorage from "../../data/Storage"

export default function UserGroup() {
    const [searchTerm, setSearchTerm] = useState("")
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
            <UserGroupList
                users={filteredUsers}
                groups={filteredGroups}
            />
        </div>
    )
}