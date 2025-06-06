import React from "react";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online: boolean;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onSelectChat }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">Messages</h1>
      </div>
      
        <div className="py-2">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  selectedChatId === chat.id 
                    ? "bg-primary-50 dark:bg-primary-900/20" 
                    : "hover:bg-default-100"
                }`}
                onClick={() => onSelectChat(chat.id)}
              >     
                <img src="vite.svg" className="w-10 bg-pink-300 rounded-full"/>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-foreground truncate">{chat.name}</h3>
                    <span className="text-tiny text-default-400">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-small text-default-500 truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-tiny text-default-400">Try a different search term</p>
            </div>
          )}
        </div>
    </div>
  );
};