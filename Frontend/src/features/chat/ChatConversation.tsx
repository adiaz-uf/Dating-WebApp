import React, { useEffect, useRef, useState } from "react";
import { Filter } from "bad-words";
import { useNavigate } from "react-router-dom";
import { MdEvent, MdMic } from "react-icons/md";

import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import Avatar from "../../components/Avatar";
import { fetchChatMessages } from "../../api/chat_service";
import { uploadAudioMessage } from "../../api/audio_service";
import { socket } from "../../api/sockets";
import { isOnline } from "../../lib/ActivityUpdater";
import { connectNotificationSocket, getNotificationSocket, onNotificationSocketRegistered } from "../../api/notifications_socket";
import { CreateEventModal } from "./CreateEventModal";
import { AudioRecorder } from "./AudioRecorder";

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
  type?: 'text' | 'audio';
  audio_url?: string;
}

interface ChatProps {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
  last_active?: string;
  messages: Message[];
  other_user_id?: string;
}

interface ChatConversationProps {
  chat: ChatProps;
  onBack?: () => void;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({ chat, onBack }) => {

  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  // fetch old messages
  useEffect(() => {
    setLoading(true);
    fetchChatMessages(chat.id)
      .then((data) => {
        const userId = localStorage.getItem("userId");
        const msgs = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          sent: userId && msg.sender_id == userId,
          time: msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          type: msg.message_type || 'text',
          audio_url: msg.audio_url
        }));
        setMessages(msgs);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // join room
    if (!socket.connected) socket.connect();
    socket.emit("join", { chat_id: chat.id, username: chat.name });

    // recieve message
    socket.on("receive_message", (data: any) => {
      if (data.chat_id === chat.id) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.msg_id || Date.now().toString(),
            text: data.content,
            sent: data.user_id == localStorage.getItem("userId"),
            time: data.sent_at ? new Date(data.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
            type: data.message_type || 'text',
            audio_url: data.audio_url
          }
        ]);
      }
    });

    // Leave room
    return () => {
      socket.emit("leave", { chat_id: chat.id, username: chat.name });
      socket.off("receive_message");
    };
  }, [chat.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    const userId = localStorage.getItem("userId");
    // Filter messagee using bad-words
    const filter = new Filter();
    const cleanMessage = filter.clean(newMessage);
    // send message
    socket.emit("send_message", {
      chat_id: chat.id,
      user_id: userId,
      content: cleanMessage,
      message_type: 'text'
    });

    if (userId && chat.other_user_id) {
      connectNotificationSocket(userId);
      onNotificationSocketRegistered(() => {
        const socket = getNotificationSocket();
        if (socket && socket.connected) {
          socket.emit("send_reminder", {
            to: chat.other_user_id,
            from: userId,
            type: "message",
            content: ` sent you a message`,
          });
        }
      });
    }
    setNewMessage("");
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    try {
      const userId = localStorage.getItem("userId");
      
      // Upload audio to server
      const result = await uploadAudioMessage(chat.id, audioBlob);
      
      if (result.success) {
        // Send audio message via socket
        socket.emit("send_message", {
          chat_id: chat.id,
          user_id: userId,
          content: "🎵 Voice message",
          message_type: 'audio',
          audio_url: result.audio_url
        });

        // Send notification
        if (userId && chat.other_user_id) {
          connectNotificationSocket(userId);
          onNotificationSocketRegistered(() => {
            const socket = getNotificationSocket();
            if (socket && socket.connected) {
              socket.emit("send_reminder", {
                to: chat.other_user_id,
                from: userId,
                type: "message",
                content: ` sent you a voice message`,
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      setError('Failed to send voice message');
    }
  };

  const handleUpload = () => {
    setShowCreateEvent(true);
  };

  const handleScheduleEvent = (eventData: { name: string; date: string; time: string }) => {
    // Format the date and time for display in English
    const eventDate = new Date(`${eventData.date}T${eventData.time}`);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Create event reminder message
    const eventMessage = `📅 Event Scheduled: "${eventData.name}"\n📍 Date: ${formattedDate}\n⏰ Time: ${formattedTime}`;
    
    const userId = localStorage.getItem("userId");
    
    // Send event as a message in the chat
    socket.emit("send_message", {
      chat_id: chat.id,
      user_id: userId,
      content: eventMessage,
      message_type: 'text'
    });

    // Send notification to other user
    if (userId && chat.other_user_id) {
      connectNotificationSocket(userId);
      onNotificationSocketRegistered(() => {
        const socket = getNotificationSocket();
        if (socket && socket.connected) {
          socket.emit("send_reminder", {
            to: chat.other_user_id,
            from: userId,
            type: "event",
            content: ` scheduled an event: "${eventData.name}"`,
          });
        }
      });
    }

    // Close modal after scheduling
    setShowCreateEvent(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // check online state
  const online = chat.last_active ? isOnline(chat.last_active, 30) : false;

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b shadow-md border-pink-200 border-divider">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
        )}
        <div className="relative w-10 h-10">
          <Avatar src={chat.avatar} />
          {online ?
            <span className="absolute bottom-0.5 right-0.5 bg-green-500 w-2 h-2 rounded-full"/> : ""
          }
        </div>
        <div className="flex-1">
          <h2 className="font-medium">{chat.name}</h2>
          <p className="text-tiny text-default-500">
            {online ? "Online" : "Offline"}
          </p>
        </div>
        <Button onClick={() => navigate(`/profile/${chat.other_user_id || chat.id}`)}>
          View Profile
        </Button>
      </div>
      
      {/* Chat messages */}
        <div className="flex flex-col gap-3 overflow-y-scroll scrollbar scrollbar-thin scrollbar-thumb-rounded px-3">
          <div className="flex justify-center my-2">
            <span className="text-tiny bg-default-100 text-default-500 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sent ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                  message.sent
                    ? "bg-pink-200 text-right text-black"
                    : "bg-gray-100 text-left text-black"
                }`}
              >
                {message.type === 'audio' ? (
                  <div className="space-y-2">
                    <div className="text-sm">🎵 Voice message</div>
                    <audio 
                      controls 
                      className="w-full max-w-xs"
                      style={{ height: '32px' }}
                    >
                      <source src={`http://localhost:5000${message.audio_url}`} type="audio/webm" />
                      Your browser does not support audio playback.
                    </audio>
                    <div className="text-xs text-gray-500">{message.time}</div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm whitespace-pre-line">{message.text}</div>
                    <div className="text-xs text-gray-500 mt-1">{message.time}</div>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      
      {/* Message input */}
      <div className="p-3 px-5 border-t border-divider shadow-md border-pink-200 mt-auto">
        <div className="flex items-end gap-2">
          <div className="relative group">
            <Button onClick={handleUpload} variant="outline" className="py-1 mb-0.5 text-2xl">
              <MdEvent/>
            </Button>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Schedule event
            </span>
            
            {/* Create Event Modal - positioned relative to button */}
            {showCreateEvent && (
              <CreateEventModal
                onClose={() => setShowCreateEvent(false)}
                onSchedule={handleScheduleEvent}
              />
            )}
          </div>

          <div className="relative group">
            <Button 
              onClick={() => setShowAudioRecorder(true)} 
              variant="outline" 
              className="py-1 mb-0.5 text-2xl"
            >
              <MdMic/>
            </Button>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-pink-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Voice message
            </span>
            
            {/* Audio Recorder - positioned relative to button */}
            {showAudioRecorder && (
              <AudioRecorder
                onSendAudio={handleSendAudio}
                onClose={() => setShowAudioRecorder(false)}
              />
            )}
          </div>
          <Input
            type="message"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSendMessage} className="mb-0.5">
            send
          </Button>
        </div>
      </div>
    </div>
  );
};