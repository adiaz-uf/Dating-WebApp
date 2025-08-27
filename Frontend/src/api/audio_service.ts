import { API_URL } from "./config";

export const uploadAudioMessage = async (chatId: string, audioBlob: Blob): Promise<any> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice-message.webm');

  const response = await fetch(`${API_URL}/chats/${chatId}/audio`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
