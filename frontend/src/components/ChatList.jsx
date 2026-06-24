import { useCallback, useEffect, useMemo, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import SocketContext from "../context/SocketContext";

const ChatList = ({ selectedChat, onSelectChat }) => {
  const { user } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);

  const [chats, setChats] = useState([]);
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [deletingChatId, setDeletingChatId] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/chats/mychat");
        setChats(res.data.chats || []);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchAcceptedFriends = async () => {
      try {
        const res = await api.get("/invitation/myinvitation");
        const currentUserId = user?._id || JSON.parse(localStorage.getItem("user"))?._id;
        const accepted = [...res.data.sent, ...res.data.received]
          .filter((inv) => inv.status === "accepted")
          .map((inv) => {
            const friendUser = inv.sender._id === currentUserId ? inv.receiver : inv.sender;
            return {
              _id: friendUser._id,
              name: friendUser.name,
              email: friendUser.email,
              profilePic: friendUser.profilePic || null,
            };
          });
        setAcceptedFriends(accepted);
      } catch (err) {
        console.log(err);
      }
    };

    fetchChats();
    fetchAcceptedFriends();
  }, [user]);

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getChatName = useCallback(
    (chat) => {
      if (chat.isGroupChat) return chat.groupName;

      const otherParticipant = chat.participants.find(
        (p) => p._id.toString() !== user._id.toString(),
      );

      return otherParticipant ? otherParticipant.name : "Unknown";
    },
    [user],
  );

  const isChatOnline = (chat) => {
    if (chat.isGroupChat) return false;

    const otherParticipant = chat.participants.find(
      (p) => p._id.toString() !== user._id.toString(),
    );

    return (
      otherParticipant &&
      onlineUsers.some(
        (id) => id.toString() === otherParticipant._id.toString(),
      )
    );
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Delete this chat? This action will remove all messages permanently.")) {
      return;
    }

    try {
      setDeletingChatId(chatId);
      await api.delete(`/chats/${chatId}`);
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      if (selectedChat === chatId) {
        onSelectChat(null);
      }
      setMenuOpenFor(null);
    } catch (err) {
      console.error("Error deleting chat:", err);
    } finally {
      setDeletingChatId(null);
    }
  };

  const openFriendChat = async (friendId) => {
    try {
      const res = await api.post("/chats/create", { receiverId: friendId });
      const chat = res.data.chat;
      if (chat) {
        setChats((prev) => [chat, ...prev.filter((item) => item._id !== chat._id)]);
        onSelectChat(chat._id);
      }
    } catch (err) {
      console.error("Error opening friend chat:", err);
    }
  };

  const filteredChats = useMemo(() => {
    if (!searchText.trim()) return chats;

    const query = searchText.toLowerCase();
    return chats.filter((chat) => {
      const name = getChatName(chat).toLowerCase();
      const lastMessage = chat.lastMessage?.content?.toLowerCase() || "";
      return name.includes(query) || lastMessage.includes(query);
    });
  }, [chats, searchText, getChatName]);

  const filteredFriends = useMemo(() => {
    if (!searchText.trim()) return [];

    const query = searchText.toLowerCase();
    return acceptedFriends.filter((friend) =>
      friend.name.toLowerCase().includes(query) ||
      friend.email.toLowerCase().includes(query),
    );
  }, [acceptedFriends, searchText]);

  return (
    <div className="w-full bg-slate-50 h-full min-h-0 overflow-hidden">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
         
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Messages
            </p>
          
        </div>

        <div className="mt-4">
          <label className="sr-only">Search messages</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search"
              className="w-full rounded-full border border-slate-200 bg-white px-12 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Messages
            </h2>
            <span className="text-xs text-slate-400">
              {filteredChats.length}
            </span>
          </div>

          <div className="space-y-3">
            {filteredFriends.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Connected contacts</p>
                    <p className="text-xs text-slate-400">Start a chat with accepted users</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredFriends.map((friend) => (
                    <div key={friend._id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{friend.name}</p>
                        <p className="text-xs text-slate-500">{friend.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openFriendChat(friend._id)}
                        className="rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-700"
                      >
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {filteredChats.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                No chats match your search.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isOnline = isChatOnline(chat);
                return (
                  <div
                    key={chat._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectChat(chat._id)}
                    className={`flex w-full items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50 ${
                      selectedChat === chat._id ? "ring-2 ring-cyan-300" : ""
                    }`}
                  >
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-cyan-600 text-white grid place-items-center text-lg font-semibold">
                          {chat.isGroupChat ? (
                            chat.groupPic ? (
                              <img src={chat.groupPic} alt={chat.groupName} className="h-full w-full object-cover" />
                            ) : (
                              getChatName(chat).charAt(0).toUpperCase()
                            )
                          ) : (
                            (() => {
                              const other = chat.participants.find((p) => p._id.toString() !== user._id.toString());
                              return other?.profilePic ? (
                                <img src={other.profilePic} alt={other.name} className="h-full w-full object-cover" />
                              ) : (
                                other?.name?.charAt(0).toUpperCase() || "U"
                              );
                            })()
                          )}

                          {!chat.isGroupChat && (
                            <span
                              className={`absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                isOnline ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            />
                          )}
                        </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {getChatName(chat)}
                            </p>
                            {chat.lastMessage?.createdAt && (
                              <span className="text-[10px] text-slate-400">
                                {formatTime(chat.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {chat.lastMessage?.content ||
                              (chat.isGroupChat
                                ? "No messages yet"
                                : "Say hello...")}
                          </p>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenFor((prev) =>
                                prev === chat._id ? null : chat._id,
                              );
                            }}
                            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                          >
                            ⋮
                          </button>
                          {menuOpenFor === chat._id && (
                            <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChat(chat._id);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-slate-100"
                              >
                                {deletingChatId === chat._id
                                  ? "Deleting..."
                                  : "Delete Chat"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
