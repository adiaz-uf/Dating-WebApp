import { API_URL } from "./config";

export async function fetchChatMessages(chatId: string | number) {
  const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Fetching messages failed");
  }
  return response.json();
}

export async function fetchUserChats() {
  const response = await fetch(`${API_URL}/chats/`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Fetching chats failed");
  }

  // Map last_active del backend
  const data = await response.json();
  if (data.chats) {
    data.chats = data.chats.map((chat: any) => ({
      ...chat,
      last_active: chat.other_last_active || chat.last_active || null
    }));
  }
  return data;
}
