import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectWebSocket, disconnectWebSocket } from '../websocket/socket';
import UserList from '../components/UserList';
import ChatBox from '../components/ChatBox';
import MessageInput from '../components/MessageInput';
import api from '../api/axios';

function Chat() {
  const { token, username, logout } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleMessageReceived = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleOnlineUsersUpdate = useCallback((users) => {
    setOnlineUsers(Array.isArray(users) ? users : []);
  }, []);

  // Connect WebSocket on mount
  useEffect(() => {
    if (token && username) {
      connectWebSocket(token, username, handleMessageReceived, handleOnlineUsersUpdate);
    }
    return () => {
      disconnectWebSocket();
    };
  }, [token, username, handleMessageReceived, handleOnlineUsersUpdate]);

  // Fetch chat history when selecting a user
  useEffect(() => {
    if (selectedUser) {
      const fetchHistory = async () => {
        try {
          const response = await api.get(`/messages/${selectedUser}`);
          // Messages come sorted desc from backend, reverse for display (oldest first)
          setMessages(response.data.reverse());
        } catch (err) {
          console.error('Failed to fetch chat history:', err);
          setMessages([]);
        }
      };
      fetchHistory();
    }
  }, [selectedUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMobileShowChat(true);
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  const handleMessageSent = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleLogout = () => {
    disconnectWebSocket();
    logout();
  };

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 glass border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold gradient-text hidden sm:block">ChatApp</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full online-pulse" />
            <span className="text-sm text-dark-300 font-medium">{username}</span>
          </div>
          <button
            id="logout-button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white bg-dark-800/50 hover:bg-red-500/20 border border-dark-600/50 hover:border-red-500/30 rounded-xl transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* User List Sidebar */}
        <div className={`${mobileShowChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-dark-700/50 bg-dark-900/50`}>
          <UserList
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            onlineUsers={onlineUsers}
          />
        </div>

        {/* Chat Area */}
        <div className={`${mobileShowChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-dark-950`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-6 py-4 glass border-b border-dark-700/50">
                <button
                  id="back-to-list-button"
                  onClick={handleBackToList}
                  className="md:hidden p-2 hover:bg-dark-700/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {selectedUser.charAt(0).toUpperCase()}
                  </div>
                  {onlineUsers.includes(selectedUser) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-dark-900 rounded-full online-pulse" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-dark-100">{selectedUser}</h2>
                  <p className="text-xs text-dark-400">
                    {onlineUsers.includes(selectedUser) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ChatBox messages={messages} currentUser={username} />

              {/* Message Input */}
              <MessageInput
                receiverUsername={selectedUser}
                onMessageSent={handleMessageSent}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-dark-800/50 mb-4">
                  <svg className="w-10 h-10 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-dark-300 mb-2">Select a conversation</h2>
                <p className="text-dark-500 text-sm">Choose a user from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
