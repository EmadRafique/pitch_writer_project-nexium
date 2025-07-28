import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
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

  try {
    await dbConnect();

    // Fetch all pitches for the user, sorted by creation date (newest first)
    const pitches = await Pitch.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent pitches

    return NextResponse.json({ 
      success: true, 
      pitches: pitches 
    }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pitches.' }, { status: 500 });
  }
} 