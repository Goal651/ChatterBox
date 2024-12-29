import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocketConfig(): Socket {
    const socketRef = useRef<Socket | null>(null);

    if (!socketRef.current) {
        socketRef.current = io('http://localhost:3001', {
            auth: {
                token: localStorage.getItem('token'),
            },
        });
    }

    const socket = socketRef.current;

    useEffect(() => {
        const handleConnectError = (error: { message: string }) => {
            if (error.message.includes('Authentication error')) {
                if (!localStorage.getItem('redirected')) {
                    localStorage.setItem('redirected', 'true');
                    window.location.href = '/login';
                }
            } else {
                console.warn('Reconnecting due to connection error...');
                socket.connect();
            }
        };

        const handleConnect = () => {
            console.log('Connected to the server');
            localStorage.removeItem('redirected');
        };

        const handleDisconnect = (reason: string) => {
            console.warn(`Disconnected: ${reason}`);
            if (reason === 'io server disconnect') {
                console.warn('Reconnecting after server disconnect...');
                socket.connect();
            } else if (reason === 'io client disconnect') {
                console.info('Client intentionally disconnected');
            } else {
                console.warn('Reconnecting due to unexpected disconnection...');
                socket.connect();
            }
        };

        const handleError = (error: unknown) => {
            console.error('Socket error:', error);
        };

        // Attach event listeners
        socket.on('connect_error', handleConnectError);
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('error', handleError);

        // Clean up event listeners on unmount
        return () => {
            socket.off('connect_error', handleConnectError);
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('error', handleError);
        };
    }, [socket]);

    return socket;
}
