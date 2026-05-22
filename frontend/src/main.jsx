import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./style.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import {GoogleOAuthProvider} from "@react-oauth/google"

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <SocketProvider><GoogleOAuthProvider clientId="697780296994-6b153v81af47ncv28i1pbgnvlbvf0j3s.apps.googleusercontent.com">

      <App />
    </GoogleOAuthProvider>
    </SocketProvider>
  </AuthProvider>,
);
