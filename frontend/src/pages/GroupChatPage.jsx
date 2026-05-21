import React, { useState } from 'react'
import GroupChatList from '../components/GroupChatList'
import GroupChatWindow from '../components/GroupChatWindow'

const GroupChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className='flex'>
      <GroupChatList onSelectChat={setSelectedChat} />
      <GroupChatWindow chatId={selectedChat} />
    </div>
  )
}

export default GroupChatPage
