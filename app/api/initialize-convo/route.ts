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
    const { anchors } = await request.json();

    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          start_div: anchors.startDiv,
          start_offset: anchors.startOffset,
          end_div: anchors.endDiv,
          end_offset: anchors.endOffset,
          content_type: anchors.contentType,
          // TODO: Add book_id when available
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
