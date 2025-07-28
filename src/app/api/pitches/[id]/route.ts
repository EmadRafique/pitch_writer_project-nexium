import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: Invalid session.' }, { status: 401 });
  }
  
  const userId = user.id;
  const pitchId = id;

  try {
    await dbConnect();

    // Find the pitch and ensure it belongs to the user
    const pitch = await Pitch.findOne({ _id: pitchId, userId });

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found or unauthorized.' }, { status: 404 });
    }

    // Delete the pitch
    await Pitch.findByIdAndDelete(pitchId);

    return NextResponse.json({ 
      success: true, 
      message: 'Pitch deleted successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to delete pitch.' }, { status: 500 });
  }
} 