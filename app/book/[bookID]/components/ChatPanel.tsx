import { ChatClient } from './ChatClient';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variable. TEST');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// This server component wraps ChatClient — fetches chat data from the database and passes it to the ChatClient component for rendering

export const ChatPanel = async ({ chatID }: { chatID: string }) => {
  if (!chatID) {
    return <div>No chat ID provided</div>;
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('chat, highlight_text, context_text')
      .eq('id', chatID)
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data) {
      return <div>Chat with id {chatID} not found</div>;
    }

    const {
      chat: chatHistory,
      highlight_text: highlightText,
      context_text: contextText,
    } = data;

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
  } catch (error) {
    console.error('Error fetching chat data:', error);
    return <div>Error loading chat</div>;
  }
};
