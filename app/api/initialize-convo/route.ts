import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variable');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { startDiv, startOffset, endDiv, endOffset, contentType, bookKey } =
      await request.json();
    console.log(
      'LOCATION STUFF',
      startDiv,
      startOffset,
      endDiv,
      endOffset,
      contentType,
      bookKey
    );
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          start_div: startDiv,
          start_offset: startOffset,
          end_div: endDiv,
          end_offset: endOffset,
          content_type: contentType,
          book_key: bookKey, //this is foreign key
        },
      ])
      .select('id');

    if (error) {
      throw error;
    }

    return NextResponse.json({ id: data[0].id }, { status: 201 });
  } catch (error) {
    console.error('ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server error' },
      { status: 500 }
    );
  }
}
