import React, { useEffect, useState, useRef } from 'react';
import { X as XIcon, Send as SendIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INTERACTION_FOLLOW_UP_CHAT } from '../prompts';
import { buildInteractionContext } from '../buildInteractionContext';
import ReactMarkdown from "react-markdown";
import { chat } from '../ai';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};
interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}
const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose
}) => {
  const {
    userProfile,
    chatContext,
    getContactById,
    events
  } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [animationState, setAnimationState] = useState('closed');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setAnimationState('opening');
      const timer = setTimeout(() => {
        setAnimationState('open');
      }, 250);
      return () => clearTimeout(timer);
    } else {
      if (animationState !== 'closed') {
        setAnimationState('closing');
        const timer = setTimeout(() => {
          setAnimationState('closed');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen]);
  // Reset messages and minimize state when chat is closed
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setIsMinimized(false);
    }
  }, [isOpen]);
  // Send initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let greeting = '';
      // If we have contact context, customize the greeting
      if (chatContext.contactId) {
        const contact = getContactById(chatContext.contactId);
        const tone = chatContext.tone || 'professional';
        if (contact) {
          greeting = `Hi ${userProfile?.name || 'there'}, happy to help you draft a follow-up message to ${contact.name} with a ${tone} tone. What would you like to say?`;
        } else {
          greeting = `Hello, ${userProfile?.name || 'there'}. What can I help you with your networking needs today?`;
        }
      } else {
        greeting = `Hello, ${userProfile?.name || 'there'}. What can I help you with your networking needs today?`;
      }
      const greetingMessage: Message = {
        id: Date.now().toString(),
        text: greeting,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
    }
  }, [isOpen, userProfile, messages.length, chatContext, getContactById]);
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [messages, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    // 1) Add the user's message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // 2) Validate we have context
    const contactId = chatContext.contactId;
    const eventId = chatContext.eventId;
    if (!contactId || !eventId) {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I’m missing this interaction’s context. Please reopen the chat from the interaction page.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      return;
    }

    // 3) Pull contact + event from context
    const contact = getContactById(contactId);
    const event = events.find(e => e.id === eventId);
    if (!contact || !event) {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I couldn’t find the contact or interaction details. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      return;
    }

    // 4) Build the compiled context
    const compiledContext = buildInteractionContext({
      user: {
        profile_summary: userProfile?.backgroundAiSummary || '',
        tone: chatContext.tone || userProfile?.preferences?.messageTone || 'professional',
        demographics: userProfile?.demographics || ''
      },
      contact: {
        name: contact.name,
        contact_ai_summary: contact.infoAiSummary || '',
        followUpFrequency: contact.preferences?.followUpFrequency,
        lastReachOutDate: contact.lastReachOutDate || undefined
      },
      interaction: {
        dateISO: event.date,
        notesAiSummary: event.notesAiSummary || '',
        tags: event.tags
      }
    });

    // 5) Build the message array for the API
    const messagesPayload = [
      { role: 'user',   content: userProfile?.backgroundAiSummary || '' },
      { role: 'system', content: INTERACTION_FOLLOW_UP_CHAT },
      { role: 'user',   content: compiledContext },
      { role: 'user',   content: userMessage.text } // the user’s free-form instruction
    ];

    // 6) Call your backend and append the AI response
    try {
      setIsProcessing(true);
      const { answer } = await chat({ messages: messagesPayload }); // returns { answer: string }
      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        text: answer, // single Markdown block to display
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (e) {
      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        text: "Sorry—something went wrong generating your draft. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsProcessing(false);
    }
  };


  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  // Don't render anything if closed and animation is complete
  if (animationState === 'closed' && !isOpen) return null;
  return <div className={`
        shadow-lg 
        fixed bottom-0 right-0 
        bg-white md:rounded-3xl flex flex-col 
        overflow-hidden z-50
        transition-all duration-300 ease-in-out
        ${animationState === 'opening' || animationState === 'open' ? 'opacity-100 md:transform-none transform-none' : 'opacity-0 md:translate-x-full translate-y-full'}
        ${isMinimized ? 'w-full md:w-[40%] h-auto md:h-auto md:bottom-6 md:right-6' : 'w-full md:w-[40%] h-full md:h-[90%] md:bottom-6 md:right-6'}
      `} style={{
    transformOrigin: 'bottom right'
  }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4 flex justify-between items-center">
        <h3 className="font-medium text-lg">AI Assistant</h3>
        <div className="flex items-center space-x-2">
          <button onClick={toggleMinimize} className="text-white hover:text-gray-200 focus:outline-none bg-white bg-opacity-20 rounded-full p-2 transition-all" aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'} title={isMinimized ? 'Expand chat' : 'Minimize chat'}>
            {isMinimized ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
          </button>
          <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none bg-white bg-opacity-20 rounded-full p-2 transition-all" aria-label="Close chat" title="Close chat">
            <XIcon size={20} />
          </button>
        </div>
      </div>

      {/* Messages - Only visible when not minimized */}
      {!isMinimized && <div className="flex-1 p-6 overflow-y-auto transition-all duration-300 ease-in-out" style={{
      maxHeight: isMinimized ? '0' : '100%'
    }}>
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-5 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-6 py-4 rounded-3xl max-w-[85%]
                ${message.sender === 'user'
                  ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white'
                  : 'bg-gray-100 text-gray-800'}`}
            >
              {message.sender === 'ai' ? (
                <div className="prose prose-md max-w-none text-gray-800">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-left whitespace-pre-wrap">{message.text}</div>
              )}
            </div>
          </div>
        ))}

          <div ref={messagesEndRef} />
        </div>}
      {/* Input - Only visible when not minimized */}
      {!isMinimized && <div className="p-4 bg-gray-50 transition-all duration-300 ease-in-out" style={{
      maxHeight: isMinimized ? '0' : '100%'
    }}>
          <div className="flex bg-white rounded-2xl overflow-hidden">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 px-5 py-3 focus:outline-none" />
            <button onClick={handleSend} disabled={!input.trim() || isProcessing } className="px-4 flex items-center justify-center
                 bg-gradient-to-r from-secondary-500 to-secondary-600
                 text-white hover:from-secondary-600 hover:to-secondary-700
                 transition-all duration-300
                 focus:outline-none disabled:opacity-50">
              <SendIcon size={20} />
            </button>
          </div>
        </div>}
    </div>;
};
export default ChatWindow;