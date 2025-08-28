import { API_URL } from "./config";

export const uploadAudioMessage = async (chatId: string, audioData: Blob | File): Promise<any> => {
  const formData = new FormData();
  
  // Determine filename based on type
  let filename: string;
  if (audioData instanceof File) {
    filename = audioData.name;
  } else {
    filename = 'voice-message.webm';
  }
  
  formData.append('audio', audioData, filename);

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
