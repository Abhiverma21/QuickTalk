import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow';

 const ChatPage = () => {
    const location = useLocation();
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
      if (location.state?.chatId) {
        setSelectedChat(location.state.chatId);
      }
    }, [location.state]);
  
   return (
    <>
        
        <div className='flex'>

        <ChatList selectedChat={selectedChat} onSelectChat={setSelectedChat}/>
        <ChatWindow chatId={selectedChat} />
        </div>
    </>
  )
}

export default ChatPage;