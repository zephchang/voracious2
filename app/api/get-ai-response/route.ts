import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { OpenaiMessageList } from '@/app/book/[bookID]/utils/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variable');
}

const supabase = createClient(supabaseUrl, supabaseKey);

type ConversationData = {
  highlight_text: string;
  context_text: string;
  chat: OpenaiMessageList;
  books: {
    context: string;
  };
};

// Switched to a message-in, message-out model instead of chat history in chat history out.
// Redundant work for DB fetching chat, but makes the React side easier to handle.

export async function POST(request: Request) {
  const { userMessage, chatID }: { userMessage: string; chatID: string } =
    await request.json();
  try {
    const { data, error } = (await supabase
      .from('conversations')
      .select('highlight_text, context_text, books(context), chat')
      .eq('id', chatID)
      .single()) as { data: ConversationData; error: any }; //ts gets confused by the supabase join

    if (error) {
      console.error(`Error: ${error.message}`);
      return NextResponse.json({ errror: error.message }, { status: 500 });
    }

    if (data) {
      const {
        highlight_text: highlightText,
        context_text: contextText,
        chat: chatHistory,
        books: { context: bookContext },
      } = data;

      const systemPrompt = `You and the user are looking at this passage from: ${bookContext}\n\n
      <passage>${contextText}</passage>\n\n
      The user has highlighted the following passage and is asking you about it <highlight>${highlightText}</highlight>`; // at some point maybe get this cuter by using anchors to add the highlight span (for claude) to the text directly.

      const updatedChat: OpenaiMessageList = [
        ...chatHistory,
        { role: 'user', content: userMessage },
      ];

      const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        system: systemPrompt,
        messages: updatedChat,
      });

      let aiResponse: string;
      if (msg.content[0] && 'text' in msg.content[0]) {
        aiResponse = msg.content[0].text;
      } else {
        aiResponse = "We didn't get anything back from the LLM";
      }

      const newMessages: OpenaiMessageList = [
        ...updatedChat,
        { role: 'assistant', content: aiResponse },
      ];

      updateDatabase(chatID, newMessages);
      return NextResponse.json({ aiResponse }, { status: 200 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function updateDatabase(chatID: string, messages: OpenaiMessageList) {
  const { data, error } = await supabase
    .from('conversations')
    .update({ chat: messages })
    .eq('id', chatID);

  if (error) {
    throw error;
  }
}
