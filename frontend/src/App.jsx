import {BrowserRouter , Routes,Route} from 'react-router-dom';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Login from './pages/Login';
import Invitation from './pages/Invitation';
import ProtectedRoute from './components/Protected';
import ChatPage  from './pages/ChatPage';
import GroupChatPage from './pages/GroupChatPage';
import ProfilePage from './pages/Profile';


function App() {

  return (
    <>
      
    <BrowserRouter>
    <Routes>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/invitations' element={<ProtectedRoute><Invitation/></ProtectedRoute>}></Route>
        <Route path='/personalchat' element={<ProtectedRoute><ChatPage/></ProtectedRoute>}></Route>
        <Route path='/group-chat' element={<ProtectedRoute><GroupChatPage/></ProtectedRoute>}></Route>
        <Route path='/profile' element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}></Route>
        <Route path='/' element={<Home/>}></Route>
    </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
