import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";


//https://chatterbox-production-bb1f.up.railway.app/
export default function useSocketConfig({ serverUrl, status }: { serverUrl: string, status: boolean }): Socket {
    const socketRef = useRef<Socket | null>(null);

    if (!socketRef.current) {
        socketRef.current = io(serverUrl, {
            auth: {
                token: localStorage.getItem('token'),
            },
        });
    }

    const [socket, setSocket] = useState(socketRef.current)


    const connectToServer = () => {
        if (socketRef.current) {
            const temp = io(serverUrl, {
                auth: {
                    token: localStorage.getItem('token'),
                },
            });
            setSocket(temp)
        }
    }

    useEffect(() => {
        const handleConnectError = (error: { message: string }) => {

            if (error.message.includes('Authentication error')) {
                if (!localStorage.getItem('redirected')) {
                    localStorage.setItem('redirected', 'true');
                    window.location.href = '/login';
                }
            } else if (error.message.includes('xhr poll error')) {
                if(localStorage.getItem('noInternet') === 'true') return
                localStorage.setItem('noInternet', 'true');
                window.location.href = '/no-internet';
            }
            //  else connectToServer()

        };

        const handleConnect = () => localStorage.removeItem('redirected');

        // Attach event listeners
        socket.on('connect_error', handleConnectError);
        socket.on('connect', handleConnect);

        // Clean up event listeners on unmount
        return () => {
            socket.off('connect_error', handleConnectError);
            socket.off('connect', handleConnect);
        };
    }, [socket]);


    useEffect(() => { if (status === true) connectToServer() }, [status])

    return socket;
}
