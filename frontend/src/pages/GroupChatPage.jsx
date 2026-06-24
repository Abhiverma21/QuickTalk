import React, { useState } from 'react'
import GroupChatList from '../components/GroupChatList'
import GroupChatWindow from '../components/GroupChatWindow'

const GroupChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-screen min-h-screen flex-col md:flex-row">
      <div className={`md:w-[360px] w-full border-b border-slate-200 md:border-r md:border-b-0 ${selectedChat ? 'hidden md:block' : ''}`}>
        <GroupChatList onSelectChat={setSelectedChat} />
      </div>
      <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 w-full h-full`}>
        <GroupChatWindow chatId={selectedChat} onBack={() => setSelectedChat(null)} />
      </div>
    </div>
  )
}

export default GroupChatPage
