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
        <h1 className="text-xl font-semibold my-2">Chats</h1>
      </div>
      
        <div className="py-2">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border border-gray-300 border-b-0 border-r-0 ${
                  selectedChatId === chat.id  
                    ? "bg-pink-100 dark:bg-pink-400/15" 
                    : "hover:bg-default-100"
                }`}
                onClick={() => onSelectChat(chat.id)}
              >     
                <div className="relative w-10 h-10">
                  <img src="vite.svg" className="w-full h-full bg-pink-300 rounded-full"/>{/* TODO: Profile Pic */}
                  <span className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full"></span>
                </div>
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