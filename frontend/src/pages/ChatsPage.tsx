import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatLayout } from "../layouts/ChatLayout";
import { ChatList } from "../features/chat/ChatList";
import { ChatConversation } from "../features/chat/ChatConversation";

export default function ChatsPage() {

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileView && selectedChat) {
      window.history.pushState({ chatOpen: true }, "");
    }
  }, [isMobileView, selectedChat]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isMobileView && selectedChat) {
        // Cancelar la navegación y volver al listado sin cambiar de ruta
        e.preventDefault();
        setSelectedChat(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMobileView, selectedChat]);

  // Set first chat as selected by default on desktop
  useEffect(() => {
    if (!isMobileView && !selectedChat && chatData.length > 0) {
      setSelectedChat(chatData[0].id);
    }
  }, [isMobileView, selectedChat]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  return (
    <ChatLayout>
      {/* Chat list - hide on mobile when a chat is selected */}
      <AnimatePresence initial={false}>
        {(!isMobileView || !selectedChat) && (
          <motion.div
            key="chatList"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.05 }}
            className={`${isMobileView ? 'w-full' : 'w-1/3 border-r shadow-md border-pink-200 border-divider'}`}
          >
            <ChatList 
              chats={chatData} 
              selectedChatId={selectedChat} 
              onSelectChat={handleChatSelect} 
            />
          </motion.div>
        )}
        {/* Chat conversation - show only when a chat is selected */}
        {selectedChat && (
          <motion.div
            key="chatConversation"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.05 }}
            className={`${isMobileView ? 'w-full' : 'w-2/3'}`}
          >
            <ChatConversation 
              chat={chatData.find(chat => chat.id === selectedChat)!} 
              onBack={isMobileView ? handleBackToList : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ChatLayout>
  );
}

// Sample chat data
export const chatData = [
  {
    id: "1",
    name: "Sophie",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
    lastMessage: "What are you doing this weekend?",
    lastMessageTime: "12:45 PM",
    unread: 2,
    online: true,
    messages: [
      { id: "m1", text: "Hey there! How's your day going?", sent: false, time: "12:30 PM" },
      { id: "m2", text: "Pretty good! Just finished work. You?", sent: true, time: "12:35 PM" },
      { id: "m3", text: "Same here. I was thinking about checking out that new restaurant downtown.", sent: false, time: "12:40 PM" },
      { id: "m4", text: "What are you doing this weekend?", sent: false, time: "12:45 PM" },
      { id: "m5", text: "Hey there! How's your day going?", sent: false, time: "13:30 PM" },
      { id: "m6", text: "Pretty good! Just finished work. You?", sent: true, time: "13:35 PM" },
      { id: "m7", text: "Same here. I was thinking about checking out that new restaurant downtown.", sent: false, time: "13:40 PM" },
      { id: "m8", text: "What are you doing this weekend?", sent: false, time: "13:45 PM" },
      { id: "m9", text: "Hey there! How's your day going?", sent: false, time: "13:30 PM" },
      { id: "m10", text: "Pretty good! Just finished work. You?", sent: true, time: "13:35 PM" },
      { id: "m11", text: "Same here. I was thinking about checking out that new restaurant downtown.", sent: false, time: "13:40 PM" },
      { id: "m12", text: "What are you doing this weekend?", sent: false, time: "13:45 PM" },
      { id: "m13", text: "Hey there! How's your day going?", sent: false, time: "13:30 PM" },
      { id: "m14", text: "Pretty good! Just finished work. You?", sent: true, time: "13:35 PM" },
      { id: "m15", text: "Same here. I was thinking about checking out that new restaurant downtown.", sent: false, time: "13:40 PM" },
      { id: "m16", text: "What are you doing this weekend?", sent: false, time: "13:45 PM" },
      { id: "m17", text: "Hey there! How's your day going?", sent: false, time: "13:30 PM" },
      { id: "m18", text: "Pretty good! Just finished work. You?", sent: true, time: "13:35 PM" },
      { id: "m19", text: "Same here. I was thinking about checking out that new restaurant downtown.", sent: false, time: "13:40 PM" },
      { id: "m20", text: "What are you doing this weekend?", sent: false, time: "13:45 PM" },
    ]
  },
  {
    id: "2",
    name: "James",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=2",
    lastMessage: "That sounds perfect!",
    lastMessageTime: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      { id: "m1", text: "Hey, want to grab coffee sometime?", sent: false, time: "Yesterday" },
      { id: "m2", text: "Sure, how about Saturday morning?", sent: true, time: "Yesterday" },
      { id: "m3", text: "That sounds perfect!", sent: false, time: "Yesterday" },
    ]
  },
  {
    id: "3",
    name: "Emma",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=3",
    lastMessage: "I love that band too!",
    lastMessageTime: "Wed",
    unread: 0,
    online: true,
    messages: [
      { id: "m1", text: "What kind of music do you listen to?", sent: true, time: "Wed" },
      { id: "m2", text: "Mostly indie and alternative. You?", sent: false, time: "Wed" },
      { id: "m3", text: "Same! Have you heard the new Arctic Monkeys album?", sent: true, time: "Wed" },
      { id: "m4", text: "Yes! I love that band too!", sent: false, time: "Wed" },
    ]
  },
  {
    id: "4",
    name: "Michael",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=4",
    lastMessage: "Let me know when you're free",
    lastMessageTime: "Mon",
    unread: 0,
    online: false,
    messages: [
      { id: "m1", text: "Hey, I'd love to meet up sometime", sent: false, time: "Mon" },
      { id: "m2", text: "That would be great! I'm pretty busy this week though", sent: true, time: "Mon" },
      { id: "m3", text: "No problem. Let me know when you're free", sent: false, time: "Mon" },
    ]
  },
  {
    id: "5",
    name: "Olivia",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=5",
    lastMessage: "That's hilarious 😂",
    lastMessageTime: "Sun",
    unread: 0,
    online: true,
    messages: [
      { id: "m1", text: "Did you see that meme I sent you?", sent: true, time: "Sun" },
      { id: "m2", text: "Yes! That's hilarious 😂", sent: false, time: "Sun" },
    ]
  },
  {
    id: "6",
    name: "Daniel",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=6",
    lastMessage: "I'll send you the details",
    lastMessageTime: "Sat",
    unread: 0,
    online: false,
    messages: [
      { id: "m1", text: "There's a cool event happening next week", sent: false, time: "Sat" },
      { id: "m2", text: "Oh really? What is it?", sent: true, time: "Sat" },
      { id: "m3", text: "It's an art exhibition. I'll send you the details", sent: false, time: "Sat" },
    ]
  },
  {
    id: "7",
    name: "Ava",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=7",
    lastMessage: "Can't wait to see you!",
    lastMessageTime: "Fri",
    unread: 0,
    online: true,
    messages: [
      { id: "m1", text: "Are we still on for tomorrow?", sent: true, time: "Fri" },
      { id: "m2", text: "Absolutely! Can't wait to see you!", sent: false, time: "Fri" },
    ]
  },
    {
    id: "8",
    name: "Ava",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=7",
    lastMessage: "Can't wait to see you!",
    lastMessageTime: "Fri",
    unread: 0,
    online: true,
    messages: [
      { id: "m1", text: "Are we still on for tomorrow?", sent: true, time: "Fri" },
      { id: "m2", text: "Absolutely! Can't wait to see you!", sent: false, time: "Fri" },
    ]
  },
    {
    id: "9",
    name: "Ava",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=7",
    lastMessage: "Can't wait to see you!",
    lastMessageTime: "Fri",
    unread: 0,
    online: true,
    messages: [
      { id: "m1", text: "Are we still on for tomorrow?", sent: true, time: "Fri" },
      { id: "m2", text: "Absolutely! Can't wait to see you!", sent: false, time: "Fri" },
    ]
  },
    {
    id: "10",
    name: "Ava",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=7",
    lastMessage: "Can't wait to see you!",
    lastMessageTime: "Fri",
    unread: 0,
    online: true,
    messages: [
      { id: "m1", text: "Are we still on for tomorrow?", sent: true, time: "Fri" },
      { id: "m2", text: "Absolutely! Can't wait to see you!", sent: false, time: "Fri" },
    ]
  }
];