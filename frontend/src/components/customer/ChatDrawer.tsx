import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User as UserIcon } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  initialMessages?: ChatMessage[];
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  bookingId,
  initialMessages = []
}) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!socket || !bookingId) return;

    socket.emit('join:booking', bookingId);

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('chat:new_message', handleNewMessage);

    return () => {
      socket.off('chat:new_message', handleNewMessage);
    };
  }, [socket, bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !socket || !user) return;

    socket.emit('chat:send_message', {
      bookingId,
      senderId: user.id,
      senderRole: user.role,
      message: text.trim()
    });

    setText('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col z-10 shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="text-base font-extrabold text-white">Live Assistance Chat</h3>
                <p className="text-[10px] text-sky-400">Direct Socket.IO Communication</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-500">
                  No messages yet. Send a message to contact your mechanic.
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id || i}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                          isMe
                            ? 'bg-sky-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.message}</p>
                        <span className={`text-[9px] block mt-1 ${isMe ? 'text-sky-200' : 'text-slate-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex items-center gap-2 bg-slate-900">
              <input
                type="text"
                placeholder="Type your message..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
