import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import SocketContext from "../context/SocketContext";

const ChatHeader = ({ chatId, onBack }) => {
  const { user } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);

  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch chat details
  useEffect(() => {
    if (!chatId) return;

    async function fetchChatDetails() {
      try {
        setLoading(true);

        const res = await api.get("/chats/mychat");
        const chat = res.data.chats.find((c) => c._id === chatId);

        if (chat) {
          const other = chat.participants.find(
            (p) => p._id.toString() !== user._id.toString(),
          );
          setOtherUser(other);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchChatDetails();
  }, [chatId, user._id]);

  // Determine online status
  const isOnline =
    otherUser &&
    onlineUsers.some((id) => id.toString() === otherUser._id.toString());
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Offline";

    const now = new Date();
    const seen = new Date(lastSeen);

    const diffMs = now - seen;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "Last seen just now";
    }

    if (minutes < 60) {
      return `Last seen ${minutes} min ago`;
    }

    if (hours < 24) {
      return `Last seen ${hours} hr ago`;
    }

    if (days === 1) {
      return `Last seen yesterday at ${seen.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return `Last seen on ${seen.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

  if (!chatId) {
    return (
      <div className="h-16 bg-white border-b flex items-center px-4">
        <p className="text-gray-500">Select a chat</p>
      </div>
    );
  }

  if (loading || !otherUser) {
    return (
      <div className="h-16 bg-white border-b flex items-center px-4">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            ←
          </button>
        )}
        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100">
          {otherUser.profilePic ? (
            <img src={otherUser.profilePic} alt={otherUser.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-sm font-semibold text-slate-700">{otherUser.name?.charAt(0).toUpperCase()}</div>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{otherUser.name}</p>
          <p className="text-sm text-gray-600">{isOnline ? 'Online' : formatLastSeen(otherUser.lastSeen)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
      </div>
    </div>
  );
};

export default ChatHeader;
