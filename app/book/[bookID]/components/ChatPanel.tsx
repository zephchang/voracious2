import { fetchRehydrateHighlight, fetchChatHistory } from '../utils/apis';
import { ChatClient } from './ChatClient';
export const ChatPanel = async ({ chatID }: { chatID: string }) => {
  if (!chatID) {
    return <div>No chat ID provided</div>;
  }

  const { highlightText, contextText } = await fetchRehydrateHighlight(chatID);

  const chatHistory: { role: string; content: string }[] =
    await fetchChatHistory(chatID);

  console.log({ highlightText });

  return (
    <>
      <ChatClient
        chatID={chatID}
        highlightText={highlightText}
        contextText={contextText}
        chatHistory={chatHistory}
      />
    </>
  );
};
