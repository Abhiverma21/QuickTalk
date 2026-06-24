import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import api from "../api/axios";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const auth = useContext(AuthContext);
  const user = auth ? auth.user : null;

  useEffect(() => {
    if (!user) return;

    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const socketUrl = isDevelopment
      ? "http://localhost:3200"
      : import.meta.env.VITE_SOCKET_URL || "https://quicktalk-6tna.onrender.com";

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    Promise.resolve().then(() => setSocket(newSocket));

    newSocket.on("userOnline", (userIds) => {
      setOnlineUsers(userIds.map((id) => id.toString()));
    });

    // listen for incoming notifications from server
    newSocket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      newSocket.off("userOnline");
      newSocket.off("newNotification");
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  // Clear online users & notifications when user logs out
  useEffect(() => {
    if (!user) {
      // defer clears to avoid synchronous setState inside effect
      Promise.resolve().then(() => {
        setOnlineUsers([]);
        setNotifications([]);
      });
    }
  }, [user]);

  useEffect(() => {
    if (socket && user && user._id) {
      socket.emit("join", user._id.toString());
    }
  }, [socket, user]);

  // fetch existing notifications on user login
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notification");
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    if (user) fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notification/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, onlineUsers, notifications, setNotifications, markAsRead }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;