import {BrowserRouter , Routes,Route} from 'react-router-dom';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Login from './pages/Login';
import Invitation from './pages/Invitation';
import ProtectedRoute from './components/Protected';
import ChatPage  from './pages/ChatPage';
import GroupChatPage from './pages/GroupChatPage';
import ProfilePage from './pages/Profile';
import Notifications from './pages/Notifications';
import NotificationToast from './components/NotificationToast';


function App() {

  return (
    <>
      <NotificationToast />
    <BrowserRouter>
    <Routes>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/invitations' element={<ProtectedRoute><Invitation/></ProtectedRoute>}></Route>
        <Route path='/personalchat' element={<ProtectedRoute><ChatPage/></ProtectedRoute>}></Route>
        <Route path='/group-chat' element={<ProtectedRoute><GroupChatPage/></ProtectedRoute>}></Route>
        <Route path='/profile' element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}></Route>
        <Route path='/notifications' element={<ProtectedRoute><Notifications/></ProtectedRoute>}></Route>
        <Route path='/' element={<Home/>}></Route>
    </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
