import { UserGroupListProps } from "../../interfaces/interfaces"
import { useEffect} from "react"
import UserComponent from "../shared/userGroup/User"
import GroupComponent from "../shared/userGroup/Group"

export default function UserGroupList({ users, groups, tab, loading }: UserGroupListProps) {


    useEffect(() => {
        console.log('user group' + tab)
    }, [tab])


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
                    <UserComponent user={user} />
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