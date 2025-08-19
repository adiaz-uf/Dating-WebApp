import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'like' | 'dislike' | 'view' | 'message';
  user: { name: string; avatar: string };
  sender_id: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) notif.read = true;
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    }
  },
});

export const { addNotification, markAllAsRead, markAsRead, setNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
