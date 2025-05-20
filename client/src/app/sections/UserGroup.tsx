import { useEffect, useState } from "react"
import SearchInput from "@/components/inputs/SearchInput"
import UserGroupList from "@/components/common/UserGroupList"
import { Group, User } from "@/types/interfaces"
import { useSocket } from "@/context/SocketContext"

export default function UserGroup({ loading }: { loading: boolean }) {
    const { socket } = useSocket()
    const [searchTerm, setSearchTerm] = useState("")
    const [users, setUsers] = useState<User[]>(localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users') as string) : [])
    const [groups, setGroups] = useState<Group[]>(localStorage.getItem('groups') ? JSON.parse(localStorage.getItem('groups') as string) : [])
    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm))
    const filteredGroups = groups.filter(group => group.groupName.toLowerCase().includes(searchTerm))
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        if (!loading) {
            setUsers(JSON.parse(localStorage.getItem('users') as string))
            setGroups(JSON.parse(localStorage.getItem('groups') as string))
        }
    }, [loading])

    useEffect(() => {
        if (socket) {
            socket.on('onlineUsers', (data) => {
                setOnlineUsers(data)
            })
            return () => {
                socket.off('onlineUsers')
            }
        }
    }, [socket])
    return (
        <div className={`flex flex-col p-2 w-[30%] h-screen gap-y-5`}>
            <SearchInput
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
            />

            <UserGroupList
                users={filteredUsers}
                groups={filteredGroups}
                loading={loading}
                onlineUsers={onlineUsers}
            />
        </div>
    )
}