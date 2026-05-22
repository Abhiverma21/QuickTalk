import React, { useContext, useEffect, useState, useRef } from "react";
import SocketContext from "../context/SocketContext";

const Toast = ({ notification, onClose }) => {
  return (
    <div className="max-w-sm rounded-lg bg-white shadow-lg ring-1 ring-black/5 p-3">
      <div className="text-sm font-medium text-slate-900">{notification.text}</div>
      <div className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</div>
    </div>
  );
};

const NotificationToast = () => {
  const { notifications } = useContext(SocketContext);
  const [toasts, setToasts] = useState([]);
  const latestCount = useRef(0);

  useEffect(() => {
    if (!notifications) return;

    // if new notification(s) arrived, enqueue the newest one(s)
    if (notifications.length > latestCount.current) {
      const newItems = notifications.slice(0, notifications.length - latestCount.current);
      // add them in order newest first
      setToasts((prev) => [...newItems, ...prev]);
      latestCount.current = notifications.length;
    }
  }, [notifications]);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((t, idx) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((p) => p !== t));
      }, 5000 + idx * 500)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, [toasts]);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t._id} notification={t} />
      ))}
    </div>
  );
};

export default NotificationToast;
