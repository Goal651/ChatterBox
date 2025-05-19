import { UserGroupListProps } from "../../interfaces/interfaces"
import UserComponent from "../user/User"
import GroupComponent from "../group/Group"

export default function UserGroupList({ users, groups, tab, loading, onlineUsers }: UserGroupListProps) {

    if (loading) {
        return (
            <div className="font-bold text-gray-200 text-lg text-center">
                Loading...
            </div>
        )
    }
    if (tab == 'users' && users.length == 0) {
        return (
            <div className="font-bold text-gray-200 text-lg text-center">
                No users found
            </div>
        )
    } else if (tab == 'groups' && groups.length == 0) {
        return (
            <div className="font-bold text-gray-200 text-lg text-center">
                No groups found
            </div>
        )
    }

    if (tab == 'users') {
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
                    <GroupComponent group={group} />
                ))}
            </div>
        )
    }
}