import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { webSocketUrl } from "@/constants/constant";

type SocketContextType = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

type SocketProviderProps = {
  children: ReactNode;
  status: boolean; // whether socket should connect or not
};

export const SocketProvider = ({ children, status }: SocketProviderProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);


  useEffect(() => {
    if (status && !socketRef.current) {
      const token = localStorage.getItem("token");
      const socketInstance = io(webSocketUrl, {
        auth: { token },
        transports: ["websocket"],
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);

      socketInstance.on("connect", () => {
        console.log("Socket connected");
        setConnected(true);
        localStorage.removeItem("redirected");
        localStorage.removeItem("noInternet");
      });

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected");
        setConnected(false);
      });

      socketInstance.on("connect_error", (error: Error) => {
        console.error("Socket connection error:", error.message);

        if (error.message.includes("Authentication error")) {
          if (!localStorage.getItem("redirected")) {
            localStorage.setItem("redirected", "true");
            window.location.href = "/login";
          }
        } else if (error.message.includes("xhr poll error")) {
          if (localStorage.getItem("noInternet") === "true") return;
          localStorage.setItem("noInternet", "true");
          window.location.href = "/no-internet";
        }
      });
    }

    // Cleanup on unmount or status change to false
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    };
  }, [status]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  return useContext(SocketContext);
};

