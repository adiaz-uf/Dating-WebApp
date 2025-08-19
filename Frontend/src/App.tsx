import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import { getNotificationSocket, connectNotificationSocket } from './api/notifications_socket';
import { useAppDispatch } from './store/hooks';
import { addNotification } from './store/notificationsSlice';
import './App.css'
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ChatsPage from "./pages/ChatsPage";
import ResetPassPage from "./pages/ResetPassPage";
import NewPassPage from "./pages/NewPassPage";
import ProfileRouteWrapper from "./features/profile/ProfileRouteWrapper";
import NotificationsPage from "./pages/NotificationsPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import ActivityUpdater from "./lib/ActivityUpdater";
import ProtectedRoute from "./lib/ProtectedRoute";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            localStorage.clear(); // Clear localStorage
            navigate('/login'); // Redirect to login after logout
        };

        handleLogout();
    }, [navigate]);

    return <p>Logging out...</p>;
}



function App() {
  const dispatch = useAppDispatch();
  const isLoggedIn = !!localStorage.getItem("userId");

  useEffect(() => {
    if (!isLoggedIn) return;
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const socket = connectNotificationSocket(userId);
    const handler = (notif: any) => {
      dispatch(addNotification({
        id: notif.notif_id?.toString() || Date.now().toString(),
        type: notif.type || "like",
        user: {
          name: notif.sender_name || notif.sender_id || "User",
          avatar: notif.avatar || "https://img.heroui.chat/image/avatar?w=200&h=200&u=" + (notif.sender_id || "user")
        },
        sender_id: notif.sender_id,
        message: notif.content || "New notification",
        time: notif.created_at || "now",
        read: notif.is_read || false,
      }));
    };
    socket.on("receive_reminder", handler);
    return () => {
      socket.off("receive_reminder", handler);
    };
  }, [dispatch, isLoggedIn]);

  return (
    <BrowserRouter>
      {isLoggedIn && <ActivityUpdater />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-pass" element={<ResetPassPage />} />
        <Route path="/new-pass" element={<NewPassPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />

        {/* OAuth callback route */}
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/chats" element={
          <ProtectedRoute>
            <ChatsPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileRouteWrapper />
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <ProfileRouteWrapper />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;