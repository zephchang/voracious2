import { BookData } from './types';

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

export async function initConvoWithAnchors({
  startDiv,
  startOffset,
  endDiv,
  endOffset,
  contentType,
}: {
  startDiv: number;
  startOffset: number;
  endDiv: number;
  endOffset: number;
  contentType: string;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/initialize-convo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      anchors: {
        startDiv,
        startOffset,
        endDiv,
        endOffset,
      },
      contentType,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to initialize converation');
  }
  return response.json();
}
