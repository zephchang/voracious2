import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variable');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface HighlightData {
  startDiv: number;
  startOffset: number;
  endDiv: number;
  endOffset: number;
  contentType: string;
  bookID: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatID = searchParams.get('chatID');

  if (!chatID) {
    return NextResponse.json({ error: 'Missing chatID' });
  }

  try {
    const highlightText: string = await rehydrateHighlight(chatID);
    const contextText: string = await rehydrateContext(chatID);

    return NextResponse.json({ highlightText, contextText });
  } catch (error) {
    console.error('Error proccessing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' });
  }
}

const rehydrateHighlight = async (chatID: string) => {
  try {
    const highlightAnchors = await fetchHighlightAnchors(chatID);
    if (!highlightAnchors) {
      throw new Error('Failed to fetch highlight data');
    }
    const { bookID, contentType, startDiv, endDiv, startOffset, endOffset } =
      highlightAnchors;

    const contentParas = await fetchBookContent(bookID, contentType);

    if (!contentParas || !Array.isArray(contentParas)) {
      throw new Error(
        'Failed to fetch book content or content is not in array'
      );
    }

    const highlightParas = contentParas.slice(startDiv, endDiv + 1);
    highlightParas[highlightParas.length - 1] = highlightParas[
      highlightParas.length - 1
    ].slice(0, endOffset);
    highlightParas[0] = highlightParas[0].slice(startOffset); //order endOffset then startOffset is important for edge case of 1 para
    const highlightText = highlightParas.join('\n');
    return highlightText;
  } catch (error) {
    console.error('Error rehydrating highlight:', error);
    throw error;
  }
};

const fetchHighlightAnchors = async (chatID: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('start_div,start_offset,end_div,end_offset,content_type,book_id')
      .eq('id', chatID);
    if (error) {
      throw error;
    }
    if (data) {
      const supabaseData = data[0];
      const highlightData: HighlightData = {
        startDiv: supabaseData.start_div,
        startOffset: supabaseData.start_offset,
        endDiv: supabaseData.end_div,
        endOffset: supabaseData.end_offset,
        contentType: supabaseData.content_type,
        bookID: supabaseData.book_id,
      };
      return highlightData;
    }
  } catch (error) {
    console.log(error);
  }
};

const fetchBookContent = async (bookID: string, contentType: string) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select(contentType)
      .eq('uuid', bookID)
      .single();

    if (error) {
      throw error;
    }
    const contentData: Record<string, any> = data;
    return contentData[contentType];
  } catch (error) {
    console.error('Error fetching book content:', error);
    return null;
  }
};

const rehydrateContext = async (chatID: string) => {
  try {
    const highlight = await fetchHighlightAnchors(chatID);
    if (!highlight) {
      throw new Error('Failed to fetch highlight data');
    }
    const { bookID, contentType, startDiv, endDiv, startOffset, endOffset } =
      highlight;

    const contentParas = await fetchBookContent(bookID, contentType);
    if (!contentParas || !Array.isArray(contentParas)) {
      throw new Error(
        'Failed to fetch book content or content is not in array'
      );
    }
    const context = contentParas
      .slice(
        Math.max(0, startDiv - 1),
        Math.min(contentParas.length + 1, endDiv + 2)
      )
      .join('\n');

    return context;
  } catch (error) {
    console.error('Error rehydrating highlight:', error);
    throw error;
  }
};
