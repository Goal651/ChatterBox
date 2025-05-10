import { useState } from "react";
import { ILoadedMessage } from "../interfaces/mainStorage";
import { Group, Message, User } from "../interfaces/interfaces";

export default function MainStorage() {
    const [loggedInUserInfo, setLoggedInUserInfo] = useState<User>();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [loadedUsers, setLoadedUsers] = useState<User[]>([]);
    const [loadedGroups, setLoadedGroups] = useState<Group[]>([]);
    const [loadedMessages, setLoadedMessages] = useState<ILoadedMessage[]>([]);


    const clearStorage = () => {
        setLoggedInUserInfo(undefined);
        setIsUserLoggedIn(false);
        setLoadedUsers([]);
        setLoadedGroups([]);
        setLoadedMessages([]);
    }


    const sortUsersByLatestMessage = (users: User[]) => {
        return users.sort((a, b) => {
            const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
            const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    };

    const sortGroupsByLatestMessage = (groups: Group[]) => {
        return groups.sort((a, b) => {
            const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
            const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    };

    const addLoggeinInUserInfo = (user: User) => {
        setLoggedInUserInfo(user);
        setIsUserLoggedIn(true);
    }

    const addLoadedUsers = (users: User[]) => {
        setLoadedUsers(sortUsersByLatestMessage(users));
    }

    const addLoadedGroups = (groups: Group[]) => {
        setLoadedGroups(sortGroupsByLatestMessage(groups));
    }

    const addLoadedMessages = (messages: Message[], user: User) => {
        setLoadedMessages(messages.map(message => ({ user, messages: [message] })));
    }


    return {
        loggedInUserInfo,
        isUserLoggedIn,
        loadedUsers,
        loadedGroups,
        loadedMessages,
        clearStorage,
        addLoggeinInUserInfo,
        addLoadedUsers,
        addLoadedGroups,
        addLoadedMessages
    }
}