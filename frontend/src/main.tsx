import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProfileProvider } from "./features/profile/ProfileContext";
import { mockProfileData } from "./features/profile/mockProfileData"; /* TODO: delete */

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProfileProvider profileData={mockProfileData} loggedInUserId="abc123"> {/* TODO: change */}
      <App />
    </ProfileProvider>
  </StrictMode>,
)
