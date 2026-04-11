import { useEffect, useRef } from 'react';

function ChatBox({ messages, currentUser }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const msgDate = formatDate(msg.timestamp);
    if (msgDate !== lastDate) {
      groupedMessages.push({ type: 'date', date: msgDate });
      lastDate = msgDate;
    }
    groupedMessages.push({ type: 'message', data: msg });
  });

  return (
    <div id="chat-messages-container" className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-800/50 mb-3">
              <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <p className="text-dark-500 text-sm">No messages yet. Say hello!</p>
          </div>
        </div>
      ) : (
        groupedMessages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${index}`} className="flex items-center justify-center py-3">
                <span className="px-3 py-1 text-xs font-medium text-dark-400 bg-dark-800/60 rounded-full">
                  {item.date}
                </span>
              </div>
            );
          }

          const msg = item.data;
          const isMine = msg.sender === currentUser;

          return (
            <div
              key={msg.id || `msg-${index}`}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-[75%] sm:max-w-[60%] px-4 py-2.5 rounded-2xl ${
                  isMine
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-md'
                    : 'bg-dark-800/80 text-dark-100 border border-dark-700/50 rounded-bl-md'
                }`}
              >
                {!isMine && (
                  <p className="text-xs font-semibold text-primary-400 mb-1">{msg.sender}</p>
                )}

                {/* Message Content by Type */}
                {(!msg.type || msg.type === 'TEXT') && (
                  <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                )}

                {msg.type === 'IMAGE' && (
                  <div className="mt-1 mb-1">
                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={msg.fileUrl}
                        alt="Shared image"
                        className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                    </a>
                  </div>
                )}

                {msg.type === 'FILE' && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 mt-1 mb-1 px-3 py-2 rounded-lg transition-colors ${
                      isMine
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-dark-700/50 hover:bg-dark-700/80 text-dark-200'
                    }`}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm truncate">{msg.content || 'Download File'}</span>
                  </a>
                )}

                {msg.type === 'AUDIO' && (
                  <div className="mt-1 mb-1">
                    <audio controls preload="metadata" className="max-w-full h-10" style={{ minWidth: '220px' }}>
                      <source src={msg.fileUrl} type="audio/webm" />
                      <source src={msg.fileUrl} type="audio/mp3" />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                <p className={`text-[10px] mt-1 text-right ${
                  isMine ? 'text-primary-200/70' : 'text-dark-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatBox;
