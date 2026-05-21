import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./style.css"
import { AuthProvider } from './context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
      <GoogleOAuthProvider
      clientId="697780296994-jrd2mt216ui2eg580bghpue880lb61q5.apps.googleusercontent.com"
    ><AuthProvider>

    <SocketProvider><App /></SocketProvider>
    
    </AuthProvider></GoogleOAuthProvider>
    
    
);