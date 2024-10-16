'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const ChatClient = ({
  chatID,
  highlightText,
  contextText,
  chatHistory,
}: {
  chatID: string;
  highlightText: string;
  contextText: string;
  chatHistory: { role: string; content: string }[];
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [chatMessages, setChatMessages] =
    useState<{ role: string; content: string }[]>(chatHistory);

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

  const createChat = (chatHistory: { role: string; content: string }[]) => {
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
      <div className="chat-history bg-white flex-grow overflow-y-auto text-sm p-4">
        {createChat(chatMessages)}
      </div>
      <div className="user-input flex flex-row bg-white p-3 border border-gray-200 rounded-md items-start">
        <textarea
          className="w-full border-0 rounded-md resize-none focus:outline-none text-sm"
          rows={4}
          placeholder="Send message..."
        />
        <button className="w-10 h-10 bg-neutral-300 text-white rounded-md">
          <strong>↑</strong>
        </button>
      </div>
    </div>
  );
};
