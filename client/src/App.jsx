import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./features/auth/login";
import SignUp from "./features/auth/signup";
import SetupPage from "./features/auth/handlesetup";
import RoomList from "./features/rooms/roomlist";
import ChatRoom from "./features/chat/chatRoom";
import AuthRoute from "./components/AuthRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css'
import { useSocketStore } from "./store/socket.store";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth.store";

function App() {

  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const connectSocket = useSocketStore((s) => s.connect);

  useEffect(() => {
    hydrateAuth();
    connectSocket();
  }, [connectSocket, hydrateAuth]);

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignUp />
            </AuthRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoomList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <SetupPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
