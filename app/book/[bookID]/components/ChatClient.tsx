'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAIResponse } from '../utils/apis';
import { OpenaiMessageList } from '../utils/types';

export const ChatClient = ({
  chatID,
  highlightText,
  contextText,
  chatHistory,
}: {
  chatID: string;
  highlightText: string;
  contextText: string;
  chatHistory: OpenaiMessageList;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [chatMessages, setChatMessages] =
    useState<OpenaiMessageList>(chatHistory);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Enter key press to send message (or button click in the JSX)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    };
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('keydown', handleKeydown);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('keydown', handleKeydown);
      }
    };
  }, []);

  /**
   * Handle Send Message
   * - optimistic UI update
   * - call API to do LLM answer + update DB
   * - await API response (will send back full convo), and update chatMessages state
   */

  useEffect(() => {
    console.log('chatMessages updated:', chatMessages);
  }, [chatMessages]);

  const handleSendMessage = async () => {
    console.log('chatMessages CHECK', chatMessages);
    const userMessage = textareaRef.current?.value.trim();

    if (userMessage) {
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
      setChatMessages((prevMessages) => {
        return [
          ...prevMessages,
          {
            role: 'user',
            content: userMessage,
          },
        ];
      });

      const { aiResponse } = await getAIResponse({ userMessage, chatID });

      setChatMessages((prevMessages) => {
        return [...prevMessages, { role: 'assistant', content: aiResponse }];
      });
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  });

  //Esc chat (encapsulate it in chat component)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.replace(pathname);
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const renderMessages = (chatHistory: OpenaiMessageList) => {
    return chatHistory.map((message, index) => {
      const roleStyling =
        message.role === 'user'
          ? 'user bg-gray-100 rounded-lsm shadow-md'
          : 'assistant';
      return (
        <div className={`${roleStyling} p-4 text-sm`} key={index}>
          {message.content}
        </div>
      );
    });
  };

  return (
    <div className="chat-panel h-screen flex flex-col p-4 bg-white">
      <div className="highlight bg-yellow-100 rounded-sm p-4 text-sm flex-shrink-0 max-h-[15vh] overflow-y-auto">
        {highlightText}
      </div>
      <div
        ref={chatRef}
        className="chat-messages bg-white flex-grow overflow-y-auto text-sm p-4"
      >
        {renderMessages(chatMessages)}
      </div>
      <div className="user-input flex flex-row bg-white p-3 border border-gray-200 rounded-md items-start">
        <textarea
          ref={textareaRef}
          className="w-full border-0 rounded-md resize-none focus:outline-none text-sm"
          rows={4}
          placeholder="Send message..."
        />
        <button
          className="w-10 h-10 bg-neutral-300 text-white rounded-md"
          onClick={handleSendMessage}
        >
          <strong>↑</strong>
        </button>
      </div>
    </div>
  );
};
