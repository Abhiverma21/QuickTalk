import { useContext } from "react";
import SocketContext from "../context/SocketContext";

const Notifications = () => {
  const { notifications, markAsRead } = useContext(SocketContext);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>

      {notifications.length === 0 ? (
        <div className="text-sm text-slate-500">No notifications</div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n._id} className={`rounded-lg p-4 ${n.isRead ? 'bg-slate-50' : 'bg-white'} shadow-sm`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">{n.text}</div>
                  <div className="text-xs text-slate-500">From: {n.sender?.name || 'System'}</div>
                  <div className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="rounded-md bg-cyan-600 px-3 py-1 text-xs text-white"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
