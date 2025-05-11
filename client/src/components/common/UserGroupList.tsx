import { UserGroupListProps } from "../../interfaces/interfaces"
import { useEffect } from "react"

export default function UserGroupList({ users, groups ,tab}: UserGroupListProps) {
    
    useEffect(() => {
        console.log('user group' + tab)
    }, [tab])


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


    return (
        <div className="flex flex-col space-y-4 overflow-y-auto h-full">

        </div>
    )
}