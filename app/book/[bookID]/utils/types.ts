export interface BookData {
  uuid: string;
  title: string;
  raw_text: string[];
  rewritten_text: string[];
}

export interface ConvoData {
  id: string;
  chat: { role: string; content: string }[];
  start_div: number;
  start_offset: number;
  end_div: number;
  end_offset: number;
}

export interface OpenaiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type OpenaiMessageList = OpenaiMessage[];
