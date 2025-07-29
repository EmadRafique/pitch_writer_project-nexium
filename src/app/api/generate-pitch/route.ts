import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dbConnect from '@/lib/mongodb';
import Pitch from '@/models/Pitch';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Fallback pitch generation function when n8n is unavailable
function generateFallbackPitch(problem: string, solution: string, targetAudience?: string): string {
  const audience = targetAudience ? ` for ${targetAudience}` : '';
  
  return `Here's a compelling pitch${audience}:

**The Problem:**
${problem}

**Our Solution:**
${solution}

**Why This Matters:**
This solution directly addresses the core issue you're facing, providing a clear path forward that delivers measurable results.

**Next Steps:**
Let's discuss how we can implement this solution and start seeing results immediately.`;

}

// Direct Gemini API integration (optional)
async function generatePitchWithGemini(problem: string, solution: string, targetAudience?: string): Promise<string> {
  if (!GOOGLE_GEMINI_API_KEY) {
    throw new Error('Google Gemini API key not configured');
  }

  try {
    // Dynamic import to avoid bundling issues
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const prompt = `Create a compelling, professional pitch based on the following information:

Problem: ${problem}
Solution: ${solution}
Target Audience: ${targetAudience || 'General audience'}

Please create a pitch that:
1. Clearly articulates the problem
2. Presents the solution in an engaging way
3. Explains why this solution matters
4. Includes a call to action
5. Is professional and persuasive

Format the response with clear sections and bullet points where appropriate.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

// Enhanced n8n webhook call with better error handling
async function callN8nWebhook(problem: string, solution: string, targetAudience?: string): Promise<string> {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N Webhook URL is not configured');
  }

  console.log('Calling n8n webhook:', N8N_WEBHOOK_URL);
  console.log('Payload:', { problem, solution, targetAudience });

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problem,
      solution,
      targetAudience,
    }),
  });

  console.log('n8n response status:', response.status);
  console.log('n8n response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('n8n error response:', errorText);
    throw new Error(`n8n workflow failed with status: ${response.status}. Error: ${errorText}`);
  }

  const responseText = await response.text();
  console.log('n8n response text length:', responseText.length);
  console.log('n8n response preview:', responseText.substring(0, 200));

  // Check for empty or invalid responses
  if (!responseText || responseText.trim() === "") {
    throw new Error("Empty response from n8n workflow - check your n8n workflow configuration");
  }

  // Check if response is just whitespace or very short
  if (responseText.trim().length < 10) {
    throw new Error("Invalid response from n8n workflow - response too short");
  }

  // Check if response contains template variables (this is the issue!)
  if (responseText.includes('{{ $json.content }}') || responseText.includes('{{ $json.text }}')) {
    console.error('❌ n8n is returning template variables instead of real content!');
    console.error('This means your n8n workflow is not properly configured.');
    throw new Error("n8n workflow is returning template variables instead of real AI content. Please check your n8n workflow configuration.");
  }

  // Try to parse as JSON first (in case n8n returns JSON)
  try {
    const jsonResponse = JSON.parse(responseText);
    console.log('n8n returned JSON:', jsonResponse);
    
    // Extract pitch content from various possible JSON structures
    if (jsonResponse.pitch) {
      return jsonResponse.pitch;
    } else if (jsonResponse.content) {
      return jsonResponse.content;
    } else if (jsonResponse.text) {
      return jsonResponse.text;
    } else if (jsonResponse.message) {
      return jsonResponse.message;
    } else if (typeof jsonResponse === 'string') {
      return jsonResponse;
    } else {
      // If it's JSON but we can't find the content, return the whole thing as string
      return JSON.stringify(jsonResponse, null, 2);
    }
  } catch {
    // If it's not JSON, return as plain text
    console.log('n8n returned plain text');
    return responseText;
  }
}

export async function POST(req: NextRequest) {
  if (!N8N_WEBHOOK_URL && !GOOGLE_GEMINI_API_KEY) {
    return NextResponse.json({ 
      error: 'Neither N8N Webhook URL nor Google Gemini API key is configured.' 
    }, { status: 500 });
  }

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

    const { title, problem, solution, targetAudience } = await req.json();

    let generatedPitch: string;


    // Try n8n first if configured
    if (N8N_WEBHOOK_URL) {
      try {
        console.log('Attempting n8n workflow...');
        generatedPitch = await callN8nWebhook(problem, solution, targetAudience);
        console.log('✅ n8n workflow successful');
      } catch (error) {
        console.error('❌ n8n workflow error:', error);
        
        // Try direct Gemini API if available
        if (GOOGLE_GEMINI_API_KEY) {
          try {
            console.log('Trying direct Gemini API...');
            generatedPitch = await generatePitchWithGemini(problem, solution, targetAudience);

            console.log('✅ Direct Gemini API successful');
          } catch (geminiError) {
            console.error('❌ Direct Gemini API error:', geminiError);
            // Fall back to basic template
            generatedPitch = generateFallbackPitch(problem, solution, targetAudience);

            console.log('✅ Using fallback pitch generation');
          }
        } else {
          // Use fallback pitch generation when n8n fails
          generatedPitch = generateFallbackPitch(problem, solution, targetAudience);

          console.log('✅ Using fallback pitch generation (no Gemini API key)');
        }
      }
    } else {
      // No n8n configured, try direct Gemini API
      try {
        console.log('No n8n configured, trying direct Gemini API...');
        generatedPitch = await generatePitchWithGemini(problem, solution, targetAudience);

        console.log('✅ Direct Gemini API successful');
      } catch (geminiError) {
        console.error('❌ Direct Gemini API error:', geminiError);
        generatedPitch = generateFallbackPitch(problem, solution, targetAudience);

        console.log('✅ Using fallback pitch generation');
      }
    }

    const newPitch = new Pitch({
      userId,
      title,
      inputData: { problem, solution, targetAudience },
      generatedPitch,
    });

    await newPitch.save();

    return NextResponse.json({ success: true, pitch: generatedPitch }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to generate and save pitch.' }, { status: 500 });
  }
}