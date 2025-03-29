"use client";

import { useState } from 'react';
import { Send } from 'lucide-react';

interface Message {
  text: string;
  timestamp: Date;
  isUser: boolean;
}

export function ChatPortal() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const newMessage: Message = {
      text: inputMessage,
      timestamp: new Date(),
      isUser: true,
    };
    
    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] w-full bg-[#1a1a1a]/95 rounded-3xl">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2d1b4d] flex-shrink-0" />
            )}
            <div className={`max-w-[80%] ${
              message.isUser 
                ? 'bg-[#4b2d7d] rounded-[20px] rounded-tr-[5px]' 
                : 'bg-[#2d1b4d] rounded-[20px] rounded-tl-[5px]'
            } px-4 py-2.5`}>
              <p className="text-[15px] text-white/90">{message.text}</p>
              <span className="text-xs text-white/50 mt-1">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-white rounded-full px-4 py-2.5 text-[15px] text-black placeholder-gray-500 outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="p-2.5 rounded-full bg-[#0066ff] hover:bg-[#0052cc] transition-colors"
          >
            <Send className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
} 