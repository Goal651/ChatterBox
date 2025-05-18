import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { webSocketUrl } from "@/constants/constant";

export default function useSocketConfig({  status }: { status: boolean }): Socket {
    const socketRef = useRef<Socket | null>(null);

    if (!socketRef.current) {
        socketRef.current = io(webSocketUrl, {
            auth: {
                token: localStorage.getItem('token'),
            },
        });
    }

    const [socket, setSocket] = useState(socketRef.current);

    const connectToServer = () => {
        if (socketRef.current) {
            const temp = io(webSocketUrl, {
                auth: {
                    token: localStorage.getItem('token'),
                },
            });
            setSocket(temp);
        }
    };

    useEffect(() => {
        const handleConnectError = (error: { message: string }) => {
            console.error("Socket connection error:", error.message);

            if (error.message.includes('Authentication error')) {
                if (!localStorage.getItem('redirected')) {
                    localStorage.setItem('redirected', 'true');
                    window.location.href = '/login';
                }
            } else if (error.message.includes('xhr poll error')) {
                if (localStorage.getItem('noInternet') === 'true') return;
                localStorage.setItem('noInternet', 'true');
                window.location.href = '/no-internet';
            }
        };

        const handleConnect = () => {
            console.log("Socket connected");
            localStorage.removeItem('redirected');
            localStorage.removeItem('noInternet');
        };

        // Attach event listeners
        socket.on('connect_error', handleConnectError);
        socket.on('connect', handleConnect);

        // Clean up event listeners on unmount
        return () => {
            socket.off('connect_error', handleConnectError);
            socket.off('connect', handleConnect);
        };
    }, [socket]);

    useEffect(() => {
        if (status === true) connectToServer();
    }, [status]);

    return socket;
}
