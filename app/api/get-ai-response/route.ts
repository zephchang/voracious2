/**
 * Handle Send Message (design principle - legbility above all else within reason. )
 * - input: chat messages (in full) ChatID (let's keep it kind of cute here)
 * input: chatID:
 * - call db - fetch chat history, Fetch highlight, highlightContext, bookContext
 * - assemble prompt (system + messages (including user message))
 * - call API to generate LLM answer
 * - append LLM answer to chatMessages
 * - update DB based on chatID
 * - await API response (will send back full convo), and update chatMessages state
 */

//TODOS: change "context" tag in books to bookContext so that we have highlight highlightContext and bookContext

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
  books: {
    context: string;
  };
};

export async function POST(request: Request) {
  const {
    messagesWithUser,
    chatID,
  }: { messagesWithUser: OpenaiMessageList; chatID: string } =
    await request.json();
  try {
    const { data, error } = (await supabase
      .from('conversations')
      .select('highlight_text, context_text, books(context)')
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
        books: { context: bookContext },
      } = data;

      console.log(
        'THIS IS THE DATA\n\n',
        'highlightContext\n',
        highlightText,
        '\n\ncontextText\n',
        contextText,
        '\n\nbookContext\n',
        bookContext
      );

      const systemPrompt = `You and the user are looking at this passage from: ${bookContext}\n\n
      <passage>${contextText}</passage>\n\n
      The user has highlighted the following passage and is asking you about it <highlight>${highlightText}</highlight>`; // at some point maybe get this cuter by using anchors to add the highlight span (for claude) to the text directly.

      console.log('SENDING TO CLAUDE');
      console.log(
        'CHAT MESSAGES HERE\n\n',
        JSON.stringify(messagesWithUser, null, 2)
      );

      const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messagesWithUser,
      });
      console.log('CLAUDE RESPONSE', msg);

      let response: string;
      if (msg.content[0] && 'text' in msg.content[0]) {
        response = msg.content[0].text;
      } else {
        response = "We didn't get anything back from the LLM";
      }

      const newMessages = [
        ...messagesWithUser,
        { role: 'assistant', content: response },
      ];

      console.log(newMessages);
      // TODO: Implement AI response generation logic here
      return NextResponse.json({ newMessages }, { status: 200 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
