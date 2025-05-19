import { User } from "@/interfaces/interfaces"
import SelectableUser from "./SelectableUser"
import { useState } from "react"

export default function SelectableUsers() {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '')
    const [selectedUsers, setSelectedUsers] = useState(new Set(''))

    const handleUserSelect = (id: string) => {
        setSelectedUsers((prev) => {
            return prev.add(id)
        })
    }

    if (!users || users.length == 0) return (
        <div>
            No users found
        </div>
    )


    return (
        <div className="flex flex-col h-full gap-y-4 overflow-auto">
            {users.map((user, index) => (
                <div key={index} onClick={() => handleUserSelect(user._id)}>
                    <SelectableUser selectedUsers={selectedUsers} user={user} />
                </div>
            ))}

        </div>
    )
}