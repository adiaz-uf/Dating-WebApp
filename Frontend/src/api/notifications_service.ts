import { API_URL } from "./config";

export interface NotificationApi {
	id: string;
	type: string;
	sender_id: string;
	content: string;
	created_at: string;
	is_read: boolean;
	avatar?: string;
	sender_name?: string;
}

// Get the 20 most recent notifications for the logged-in user
export async function fetchNotifications(): Promise<NotificationApi[]> {
    	const res = await fetch(`${API_URL}/reminder/`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error("Failed to fetch notifications");
	const data = await res.json();
	return data.reminder || [];
}
// Mark a single notification as read
export async function markNotificationAsRead(notif_id: string) {
    
	const res = await fetch(`${API_URL}/reminder/mark_read/${notif_id}`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) throw new Error("Failed to mark notification as read");
	return res.json();
}

// Mark all notifications as read for the current user
export async function markAllNotificationsAsRead() {
	const res = await fetch(`${API_URL}/reminder/mark_all_read`, {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) throw new Error("Failed to mark all notifications as read");
	return res.json();
}


