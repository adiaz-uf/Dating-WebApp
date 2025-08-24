import React, { useEffect, useRef, useState } from "react";
import { Filter } from "bad-words";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import Avatar from "../../components/Avatar";
import { fetchChatMessages } from "../../api/chat_service";
import { socket } from "../../api/sockets";
import { isOnline } from "../../lib/ActivityUpdater";
import { connectNotificationSocket, getNotificationSocket, onNotificationSocketRegistered } from "../../api/notifications_socket";

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
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
          time: msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
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
            time: data.sent_at ? new Date(data.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
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
      content: cleanMessage
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

  const handleUpload = () => {}

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
                <div className="text-sm">{message.text}</div>
                <div className="text-xs text-gray-500 mt-1">{message.time}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      
      {/* Message input */}
      <div className="p-3 px-5 border-t border-divider shadow-md border-pink-200 mt-auto">
        <div className="flex items-end gap-2">
          <Button onClick={handleUpload}>
            +
          </Button>
          <Input
            type="message"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSendMessage}>
            send
          </Button>
        </div>
      </div>
    </div>
  );
};