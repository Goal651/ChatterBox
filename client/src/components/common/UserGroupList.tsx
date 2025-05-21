import { UserGroupListProps } from "../../types/interfaces"
import UserComponent from "../user/User"
import GroupComponent from "../group/Group"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

export default function UserGroupList({ users, groups, loading, onlineUsers }: UserGroupListProps) {
    const param = useParams() as { tab: string }
    const [tab, setTab] = useState('')

    useEffect(() => { setTab(param.tab) }, [param])

    if (loading) {
        return (
            <div className="font-bold text-gray-200 text-lg text-center">
                Loading...
            </div>
        )
    }
    if (tab == 'dm' && users.length == 0) {
        return (
            <div className="font-bold text-gray-200 text-lg text-center">
                No users found
            </div>
        )
    } else if (tab == 'grp' && groups.length == 0) {
        return (
            <div className="font-bold text-gray-200 text-lg text-center">
                No groups found
            </div>
        )
    }

    if (tab == 'dm') {
        return (
            <div className="flex flex-col gap-y-1 overflow-y-auto h-full">
                {users.map((user) => (
                    <UserComponent key={user._id}
                        onlineUsers={onlineUsers}
                        user={user} />
                ))}
            </div>
        )
    } else {
        return (
            <div className="flex flex-col gap-y-2 overflow-y-auto h-full">
                {groups.map((group) => (
                    <GroupComponent key={group._id} group={group} />
                ))}
            </div>
        )
    }
}