import { useEffect, useState } from "react";
import { fetchUserChats } from "../api/chat_service";
import { AnimatePresence, motion } from "framer-motion";
import { ChatLayout } from "../layouts/ChatLayout";
import { ChatList } from "../features/chat/ChatList";
import { ChatConversation } from "../features/chat/ChatConversation";

export default function ChatsPage() {

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 768);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchUserChats()
      .then((data) => {
        // Map backend fields to ChatList props
        const mappedChats = (data.chats || []).map((chat: any) => {
          const messages = chat.last_message ? [{
            id: chat.last_message_at || "1",
            text: chat.last_message,
            sent: false,
            time: chat.last_message_at
              ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ""
          }] : [];
          return {
            id: chat.chat_id,
            name: chat.other_first_name || chat.other_username || "",
            avatar: chat.other_avatar || "/default-avatar.png",
            lastMessage: chat.last_message || "",
            lastMessageTime: chat.last_message_at
              ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : "",
            unread: 0,
            messages,
            other_user_id: chat.other_user_id,
            last_active: chat.last_active || chat.other_last_active || null,
          };
        });
        setChats(mappedChats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isMobileView && selectedChat) {
      window.history.pushState({ chatOpen: true }, "");
    }
  }, [isMobileView, selectedChat]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isMobileView && selectedChat) {
        e.preventDefault();
        setSelectedChat(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMobileView, selectedChat]);

  // Set first chat as selected by default on desktop
  useEffect(() => {
    if (!isMobileView && !selectedChat && chats.length > 0) {
      setSelectedChat(chats[0].id);
    }
  }, [isMobileView, selectedChat, chats]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  if (loading) return <div className="p-8 text-center">Cargando chats...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
              chats={chats} 
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
              chat={chats.find(chat => chat.id === selectedChat)!} 
              onBack={isMobileView ? handleBackToList : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ChatLayout>
  );
}

