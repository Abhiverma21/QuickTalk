import React, { useEffect, useState } from "react";
import api from "../api/axios";

const SearchUser = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState([]);
  const [friend, setFriend] = useState([]);

  useEffect(() => {
    fetchFriends();
    fetchInvited();
  }, []);
  useEffect(() => {
    const delay = setTimeout(() => {
      search();
    }, 1000);
    return () => clearTimeout(delay);
  }, [query]);

  async function search() {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      let response = await api.get("/users/search", {
        params: { query },
      });
      setUsers(response.data.users || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }
  async function sendInvitation(userId) {
    try {
      let response = await api.post("/invitation/send", {
        receivers: [userId],
      });
      setInvited((prev) => [...prev, userId]);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  }
  async function fetchFriends() {
    try {
      const res = await api.get("/invitation/myinvitation");

      const accepted = [...res.data.sent, ...res.data.received]
        .filter((inv) => inv.status === "accepted")
        .map((inv) =>
          inv.sender._id === res.data.currentUserId
            ? inv.receiver._id
            : inv.sender._id,
        );

      setFriend(accepted);
    } catch (err) {
      console.log(err);
    }
  }
  async function fetchInvited() {
    try {
      const res = await api.get("/invitation/myinvitation");

      const ids = res.data.sent.map((inv) => inv.receiver._id);

      setInvited(ids);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-md">
      <input
        type="text"
        placeholder="Search User..."
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="mt-3 text-gray-500">Searching...</p>}

      <div className="mt-4 space-y-3">
        {query && users.length === 0 && !loading && <p>No user found</p>}
        {users &&
          users.map((user) => (
            <div
              key={user._id}
              className="p-3 border rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex">
                 <img src={user.profilePic} className="size-10 rounded-3xl"/>
                 <div> <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>   <button
                onClick={() => sendInvitation(user._id)}
                disabled={
                  invited.includes(user._id) || friend.includes(user._id)
                }
                className={`px-3 py-1 rounded-md text-white ${
                  friend.includes(user._id)
                    ? "bg-green-500"
                    : invited.includes(user._id)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500"
                }`}
              >
                {friend.includes(user._id)
                  ? "Connected"
                  : invited.includes(user._id)
                    ? "Invitation Sent"
                    : "Add Friend"}
              </button></div>
             
              </div>
             
           
            </div>
          ))}
      </div>
    </div>
  );
};

export default SearchUser;
