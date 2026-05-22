import { useCallback, useEffect, useState, useContext, useRef } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import SocketContext from "../context/SocketContext";

const GroupChatWindow = ({ chatId }) => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [editText, setEditText] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      const res = await api.get(`/message/${chatId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  }, [chatId]);

  const fetchGroupDetails = useCallback(async () => {
    if (!chatId) return;

    try {
      const res = await api.get("/groups/my");
      const g = (res.data.groups || []).find((x) => x._id === chatId);
      setGroup(g || null);
    } catch (err) {
      console.error(err);
    }
  }, [chatId]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const res = await api.get('/users/connected');
      setAvailableUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;
    void (async () => {
      await Promise.all([fetchMessages(), fetchGroupDetails()]);
    })();
  }, [chatId, fetchMessages, fetchGroupDetails]);

  useEffect(() => {
    if (!user?._id || group?.groupAdmin?._id !== user._id) return;
    void (async () => {
      await fetchAvailableUsers();
    })();
  }, [group, user, fetchAvailableUsers]);

  const isAdmin = user?._id && group?.groupAdmin?._id === user._id;
  const addableUsers = availableUsers.filter((u) => !group?.participants?.some((p) => p._id === u._id));

  const addUser = async (userId) => {
    if (!chatId) return;
    setMemberLoading(true);
    try {
      await api.put(`/groups/${chatId}/add`, { userId });
      await fetchGroupDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setMemberLoading(false);
    }
  };

  const removeUser = async (userId) => {
    if (!chatId) return;
    setMemberLoading(true);
    try {
      await api.put(`/groups/${chatId}/remove`, { userId });
      await fetchGroupDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setMemberLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("join", user._id);
    }
  }, [socket, user]);

  useEffect(() => {
    if (!socket || !chatId) return;

    const handleReceiveMessage = (message) => {
      if (message.chat?._id === chatId || message.chat === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleUpdate = (updatedMsg) => {
      if (updatedMsg.chat?._id === chatId || updatedMsg.chat === chatId) {
        setMessages((prev) => prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)));
      }
    };

    const handleDelete = (deletedMsg) => {
      if (deletedMsg.chat?._id === chatId || deletedMsg.chat === chatId) {
        setMessages((prev) => prev.map((m) => (m._id === deletedMsg._id ? deletedMsg : m)));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageUpdated", handleUpdate);
    socket.on("messageDeleted", handleDelete);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageUpdated", handleUpdate);
      socket.off("messageDeleted", handleDelete);
    };
  }, [socket, chatId]);

  async function sendMessage() {
    if (!newMessage.trim() && !file) return;

    setLoading(true);
    try {
      if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("chatId", chatId);
        if (newMessage.trim()) form.append("content", newMessage);

        await api.post(`/message/send`, form);

        setFile(null);
        setNewMessage("");
      } else {
        await api.post(`/message/send`, {
          content: newMessage,
          chatId,
        });

        setNewMessage("");
      }

      await fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Select a group to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col h-screen bg-gray-50 overflow-hidden relative ">
      <div className="h-20 bg-white border-b px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100">
            {group?.groupPic ? (
              <img src={group.groupPic} alt={group?.groupName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-sm font-semibold text-slate-700">{group?.groupName?.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900 leading-tight">{group?.groupName || 'Group conversation'}</p>
            <p className="text-xs text-slate-500 mt-1">
              {group ? `${group.participants.length} members` : 'Loading group...'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          onClick={() => setShowMembers((s) => !s)}
        >
          Members
        </button>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-1 min-h-60 items-center justify-center rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm">
            No messages yet. Send the first one to start the conversation.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?._id;

            return (
              <div key={msg._id} className={`w-full flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="mr-3">
                    {msg.sender?.profilePic ? (
                      <img src={msg.sender.profilePic} alt={msg.sender.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-cyan-600 text-white grid place-items-center font-semibold">{msg.sender?.name?.charAt(0).toUpperCase() || 'U'}</div>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[72%] rounded-3xl border px-4 py-3 text  -left text-sm shadow-sm transition ${
                    isMe
                      ? 'border-blue-200 bg-blue-500 text-white hover:bg-blue-600'
                      : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    if (isMe) {
                      setSelectedMsg(msg);
                      setEditText(msg.content);
                    }
                  }}
                >
                  {!isMe && (
                    <p className="text-xs font-semibold text-slate-600 mb-1">{msg.sender?.name || 'Unknown'}</p>
                  )}
                  {/* Attachment rendering */}
                  {msg.attachment && msg.attachment.url && msg.attachment.mimetype?.startsWith('image') ? (
                    <img src={msg.attachment.url} alt="attachment" className="mb-2 rounded-xl object-contain max-w-sm max-h-80" />
                  ) : (
                    (() => {
                      const imgMatch = (msg.content || "").match(/(https?:\/\/\S+\.(png|jpe?g|gif|webp|avif|svg))/i);
                      if (imgMatch) {
                        return <img src={imgMatch[1]} alt="attachment" className="mb-2 rounded-xl object-contain max-w-sm max-h-80" />;
                      }
                      return <p className="whitespace-pre-wrap wrap-break-word">{msg.content}</p>;
                    })()
                  )}
                  <p className="mt-2 text-[10px] opacity-70 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {selectedMsg && (
        <div className="absolute inset-x-4 bottom-28 mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
          <p className="text-sm font-semibold text-slate-900">Edit message</p>
          <p className="text-xs text-slate-500">Update your message or remove it from the chat.</p>

          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={async () => {
                await api.put(`/message/${selectedMsg._id}`, { content: editText });
                setSelectedMsg(null);
                fetchMessages();
              }}
              disabled={!editText.trim()}
            >
              Save
            </button>

            <button
              type="button"
              className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              onClick={async () => {
                await api.delete(`/message/${selectedMsg._id}`);
                setSelectedMsg(null);
                fetchMessages();
              }}
            >
              Delete
            </button>

            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={() => setSelectedMsg(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showMembers && (
        <div className="absolute right-4 top-24 z-20 w-[320px] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Members</p>
              <p className="text-xs text-slate-500">Manage group participants</p>
            </div>
            <button
              type="button"
              className="text-sm text-slate-500 hover:text-slate-800"
              onClick={() => setShowMembers(false)}
            >
              Close
            </button>
          </div>

          {isAdmin && (
            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-900">Add member</p>
              <div className="max-h-32 space-y-2 overflow-y-auto pr-2">
                {addableUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
                      <span className="text-sm text-slate-800">{u.name}</span>
                      <button
                        type="button"
                        className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
                        disabled={memberLoading}
                        onClick={() => addUser(u._id)}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                {addableUsers.length === 0 && (
                  <p className="text-xs text-slate-500">No available connected users to add.</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-2">
            {group?.participants?.map((p) => (
              <div key={p._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100">
                    {p.profilePic ? (
                      <img src={p.profilePic} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-sm font-semibold text-slate-700">{p.name?.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p._id === group.groupAdmin?._id && (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">Admin</span>
                  )}
                  {isAdmin && p._id !== group.groupAdmin?._id && (
                    <button
                      type="button"
                      className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                      disabled={memberLoading}
                      onClick={() => removeUser(p._id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-white">
        {file && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-sm">
            <span className="truncate text-slate-700">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-red-500 hover:underline">Remove</button>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium hover:bg-slate-100">📎</button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            disabled={loading}
          />

          <input ref={fileInputRef} type="file" className="hidden" disabled={loading} onChange={(e) => setFile(e.target.files?.[0] || null)} />

          <button type="button" onClick={sendMessage} disabled={loading || (!newMessage.trim() && !file)} className="inline-flex items-center justify-center rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatWindow;
