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
      <div className="flex h-screen min-h-screen flex-col md:flex-row">
        <div className={`md:w-[360px] w-full border-b border-slate-200 md:border-r md:border-b-0 ${selectedChat ? 'hidden md:block' : ''}`}>
          <ChatList selectedChat={selectedChat} onSelectChat={setSelectedChat} />
        </div>
        <div className={`${selectedChat ? 'block' : 'hidden md:block'} flex-1 w-full h-full`}>
          <ChatWindow chatId={selectedChat} onBack={() => setSelectedChat(null)} />
        </div>
      </div>
    </>
  )
}

export default ChatPage;