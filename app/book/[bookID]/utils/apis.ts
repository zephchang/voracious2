import { MessageStream } from '@anthropic-ai/sdk/lib/MessageStream.mjs';
import { OpenaiMessageList } from './types';

export async function fetchBookContent({ uuid }: { uuid: string }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/fetch-book?uuid=${uuid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch book content');
  }

  return response.json();
}

export async function initConvoWithLocation({
  highlightText,
  contextText,
  startDiv,
  startOffset,
  endDiv,
  endOffset,
  contentType,
  bookKey,
}: {
  highlightText: string;
  contextText: string;
  startDiv: number;
  startOffset: number;
  endDiv: number;
  endOffset: number;
  contentType: string;
  bookKey: string;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/initialize-convo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      highlightText,
      contextText,
      startDiv,
      startOffset,
      endDiv,
      endOffset,
      contentType,
      bookKey,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to initialize converation');
  }
  return response.json();
}

export async function fetchRehydrateHighlight(chatID: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const response = await fetch(
    `${baseUrl}/api/rehydrate-highlight?chatID=${chatID}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch rehydrated highlight');
  }

  return response.json();
}

export async function fetchChatHistory({ chatID }: { chatID: string }) {
  console.log('FETCH CHAT ID CHECK', chatID);
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  console.log(
    'URL CHECK',
    `${baseUrl}/api/fetch-chat-history?chatID=${chatID}`
  );

  const response = await fetch(
    `${baseUrl}/api/fetch-chat-history?chatID=${chatID}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch chat history');
  }

  return response.json();
}

export async function getAIResponse({
  userMessage,
  chatID,
}: {
  userMessage: string;
  chatID: string;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/get-ai-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userMessage,
      chatID,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to do get AI response');
  }

  return response.json();
}
