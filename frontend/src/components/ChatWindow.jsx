import { useEffect, useState, useContext, useRef } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import SocketContext from "../context/SocketContext";
import ChatHeader from "./ChatHeader";

const ChatWindow = ({ chatId }) => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const fileInputRef = useRef(null);

  const [selectedMsg, setSelectedMsg] = useState(null);
  const [editText, setEditText] = useState("");

  const bottomRef = useRef(null);

  // Fetch messages
  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const res = await api.get(`/message/${chatId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.log(err);
    }
  };

  // Load messages when chat changes
  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Join socket room
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("join", user._id);
    }
  }, [socket, user]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleReceiveMessage = (message) => {
      if (
        message.chat?._id === chatId ||
        message.chat === chatId
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleUpdate = (updatedMsg) => {
      if (
        updatedMsg.chat?._id === chatId ||
        updatedMsg.chat === chatId
      ) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === updatedMsg._id ? updatedMsg : m
          )
        );
      }
    };

    const handleDelete = (deletedMsg) => {
      if (
        deletedMsg.chat?._id === chatId ||
        deletedMsg.chat === chatId
      ) {
        setMessages((prev) =>
          prev.filter((m) => m._id !== deletedMsg._id)
        );
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

  // Send message
  async function sendMessage() {
    if (!newMessage.trim() && !file) return;

    setLoading(true);

    try {
      if (file) {
        const form = new FormData();

        form.append("file", file);
        form.append("chatId", chatId);

        if (newMessage.trim()) {
          form.append("content", newMessage);
        }

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

      fetchMessages();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // No chat selected
  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-slate-500">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col h-screen bg-gray-50 overflow-hidden relative">

      {/* Header */}
      <div className="shrink-0">
        <ChatHeader chatId={chatId} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">

        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm">
            No messages yet. Send the first message to start the chat.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === user._id;

            return (
              <div
                key={msg._id}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  onClick={() => {
                    if (isMe) {
                      setSelectedMsg(msg);
                      setEditText(msg.content);
                    }
                  }}
                  className={`max-w-[72%] rounded-[26px] border px-4 py-3 text-sm shadow-sm transition cursor-pointer ${
                    isMe
                      ? "border-blue-200 bg-blue-500 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                >

                  {/* Image Attachment */}
                  {msg.attachment &&
                  msg.attachment.url &&
                  msg.attachment.mimetype?.startsWith("image") ? (
                    <img
                      src={msg.attachment.url}
                      alt="attachment"
                      className="mb-2 rounded-xl object-contain max-w-sm max-h-80"
                    />
                  ) : (
                    <>
                      {/* Old image URL support */}
                      {(() => {
                        const imgMatch = (
                          msg.content || ""
                        ).match(
                          /(https?:\/\/\S+\.(png|jpe?g|gif|webp|avif|svg))/i
                        );

                        if (imgMatch) {
                          return (
                            <img
                              src={imgMatch[1]}
                              alt="attachment"
                              className="mb-2 rounded-xl object-contain max-w-sm max-h-80"
                            />
                          );
                        }

                        return (
                            <p className="whitespace-pre-wrap wrap-break-word">
                            {msg.content}
                          </p>
                        );
                      })()}
                    </>
                  )}

                  {/* Time */}
                  <p className="mt-2 text-[10px] opacity-70 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {/* Edit Popup */}
      {selectedMsg && (
        <div className="absolute inset-x-4 bottom-24 mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl z-50">

          <p className="text-sm font-semibold text-slate-900">
            Edit message
          </p>

          <p className="mb-3 text-xs text-slate-500">
            Update or delete your message
          </p>

          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />

          <div className="mt-3 flex flex-wrap gap-2">

            {/* Save */}
            <button
              disabled={!editText.trim()}
              className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
              onClick={async () => {
                try {
                  await api.put(`/message/${selectedMsg._id}`, {
                    content: editText,
                  });

                  setSelectedMsg(null);

                  fetchMessages();
                } catch (err) {
                  console.log(err);
                }
              }}
            >
              Save
            </button>

            {/* Delete */}
            <button
              className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              onClick={async () => {
                try {
                  await api.delete(`/message/${selectedMsg._id}`);

                  setSelectedMsg(null);

                  fetchMessages();
                } catch (err) {
                  console.log(err);
                }
              }}
            >
              Delete
            </button>

            {/* Cancel */}
            <button
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={() => setSelectedMsg(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="shrink-0 border-t bg-white p-4">

        {file && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-sm">
            <span className="truncate text-slate-700">
              {file.name}
            </span>

            <button
              onClick={() => setFile(null)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">

          {/* Message Input */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium hover:bg-slate-100"
          >
            📎
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={loading}
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
          />

          {/* Upload Button */}
          

          {/* Send Button */}
          <button
            type="button"
            onClick={sendMessage}
            disabled={
              loading ||
              (!newMessage.trim() && !file)
            }
            className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;