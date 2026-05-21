import React, { useState } from 'react'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow';

 const ChatPage = () => {
    

    const [selectedChat, setSelectedChat] = useState(null);
  
   return (
    <>
        
        <div className='flex'>

        <ChatList onSelectChat={setSelectedChat}/>
        <ChatWindow chatId={selectedChat} />
        </div>
    </>
  )
}

export default ChatPage;