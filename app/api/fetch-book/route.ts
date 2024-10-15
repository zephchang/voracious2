import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variable. TEST');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Book {
  uuid: string;
  title: string;
  raw_text: string[];
  rewritten_text: string[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const book_uuid = searchParams.get('uuid');

  if (!book_uuid) {
    return NextResponse.json(
      { error: 'Book UUID is required' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('uuid', book_uuid)
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { error: `Book with UUID ${book_uuid} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(data as Book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
