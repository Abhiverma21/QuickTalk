import { useEffect, useMemo, useState, useContext } from 'react'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'

const GroupChatList = ({ onSelectChat }) => {
  const { user } = useContext(AuthContext)

  const [groups, setGroups] = useState([])
  const [connectedUsers, setConnectedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const res = await api.get('/groups/my')
      setGroups(res.data.groups || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchConnectedUsers = async () => {
    try {
      const res = await api.get('/users/connected')
      setConnectedUsers(res.data.users || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchGroups(), fetchConnectedUsers()])
    }

    loadData()
  }, [])

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const createGroup = async () => {
    if (!groupName.trim() || selectedIds.length === 0) return
    try {
      const res = await api.post('/groups/create', {
        groupName: groupName.trim(),
        participantIds: selectedIds,
      })

      await fetchGroups()
      setShowCreate(false)
      setGroupName('')
      setSelectedIds([])
      if (res.data.chat) onSelectChat(res.data.chat._id)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredGroups = useMemo(() => {
    if (!searchText.trim()) return groups

    const query = searchText.toLowerCase()
    return groups.filter((group) => {
      const name = group.groupName?.toLowerCase() || ''
      const message = group.lastMessage?.content?.toLowerCase() || ''
      return name.includes(query) || message.includes(query)
    })
  }, [groups, searchText])

  const visibleUsers = useMemo(() => {
    if (!user || !user._id) return connectedUsers
    return connectedUsers.filter((u) => u._id !== user._id)
  }, [connectedUsers, user])

  return (
    <div className="w-full bg-white h-full min-h-0 flex flex-col md:w-80">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Group Chat</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-500"
            onClick={() => setShowCreate((prev) => !prev)}
          >
            + New
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="group-search" className="sr-only">
            Search groups
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
            <input
              id="group-search"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search groups"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 shadow-sm">
            Loading your groups...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 shadow-sm">
            {groups.length === 0
              ? 'You have not joined any groups yet.'
              : 'No groups match your search.'}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <button
              key={group._id}
              type="button"
              onClick={() => onSelectChat(group._id)}
              className="w-full rounded-3xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-cyan-200 hover:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{group.groupName}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {group.lastMessage
                      ? `${group.lastMessage.sender?.name || 'Someone'}: ${group.lastMessage.content}`
                      : 'No messages yet'}
                  </p>
                </div>
                
              </div>
            </button>
          ))
        )}
      </div>

      {showCreate && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Create a new group</p>
              <p className="text-xs text-slate-500">Add members and start a fresh conversation.</p>
            </div>
            <button
              type="button"
              className="text-sm text-slate-500 transition hover:text-slate-700"
              onClick={() => setShowCreate(false)}
            >
              Close
            </button>
          </div>

          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />

          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-slate-800">Choose participants</p>
            <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
              {visibleUsers.length > 0 ? (
                visibleUsers.map((person) => (
                  <label
                    key={person._id}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{person.name}</p>
                      <p className="text-xs text-slate-500">{person.email}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(person._id)}
                      onChange={() => toggleSelect(person._id)}
                      className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                ))
              ) : (
                <p className="text-sm text-slate-500">No connected users are available right now.</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              className="flex-1 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={createGroup}
              disabled={!groupName.trim() || selectedIds.length === 0}
            >
              Create Group
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupChatList
