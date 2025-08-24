import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { NotificationCountProvider } from "./context/NotificationCountContext";
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
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
import NotFoundPage from "./pages/404Page";
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
  // NotificationCountProvider wraps the whole app
  return (
    <NotificationCountProvider>
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
          <Route path="*" element={<NotFoundPage />} />

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
    </NotificationCountProvider>
  );
}

export default App;