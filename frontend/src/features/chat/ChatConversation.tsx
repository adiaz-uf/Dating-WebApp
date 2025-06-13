import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Button} from "../../components/Button";
import {Input} from "../../components/Input";
import Avatar from "../../components/Avatar";

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
  online: boolean;
  messages: Message[];
}

interface ChatConversationProps {
  chat: ChatProps;
  onBack?: () => void;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({ chat, onBack }) => {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      text: newMessage,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // Simulate reply after a delay
    setTimeout(() => {
      const replies = [
        "That sounds great!",
        "I'd love to hear more about that.",
        "Interesting! Tell me more.",
        "I'm not sure I understand. Can you explain?",
        "Let's meet up soon!",
        "I was thinking the same thing!",
        "Haha, that's funny 😂",
        "I'll get back to you on that."
      ];
      
      const replyMsg: Message = {
        id: `reply-${Date.now()}`,
        text: replies[Math.floor(Math.random() * replies.length)],
        sent: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, replyMsg]);
    }, 1000 + Math.random() * 2000);
  };

  const handleUpload = () => {}

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
          {chat.online ?
            <span className="absolute bottom-0.5 right-0.5 bg-green-500 w-2 h-2 rounded-full"/> : ""
          }
        </div>
        <div className="flex-1">
          <h2 className="font-medium">{chat.name}</h2>
          <p className="text-tiny text-default-500">
            {chat.online ? "Online" : "Offline"}
          </p>
        </div>
        <Button onClick={() => navigate(`/profile/${chat.id}`)}>
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