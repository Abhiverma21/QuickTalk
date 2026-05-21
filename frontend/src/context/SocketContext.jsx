import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);
  const [onlineUsers , setOnlineUsers] = useState([]);
  const auth = useContext(AuthContext);
  const user = auth ? auth.user : null;
  

  useEffect(() => {
    if (!user) {
      return;
    }

    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("userOnline", (userIds) => {
      setOnlineUsers(userIds.map((id) => id.toString()));
    });

    return () => {
      newSocket.off("userOnline");
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  // Clear online users when user logs out (separate effect to avoid sync setState in socket effect)
  useEffect(() => {
    if (!user && onlineUsers.length !== 0) {
      setOnlineUsers([]);
    }
  }, [user, onlineUsers]);

  useEffect(() => {
    if (socket && user && user._id) {
      socket.emit("join", user._id.toString());
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};