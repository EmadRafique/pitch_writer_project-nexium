# Setup Guide for Pitch Writer AI

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# n8n Webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# Optional: Google Gemini API Key (if you want to use it directly instead of n8n)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Current Issues and Solutions

### 1. n8n Workflow Error (Primary Issue)
**Problem**: Your n8n workflow is failing because the Google Gemini API quota has been exceeded.

**Solutions**:
- **Option A**: Upgrade your Google Gemini API plan to get more quota
- **Option B**: Wait for the quota to reset (usually monthly)
- **Option C**: The app now has a fallback system that will generate pitches even when n8n is down

### 2. Missing Environment Variables
**Problem**: The app requires several environment variables that may not be configured.

**Solution**: 
1. Create a `.env.local` file with the variables listed above
2. Get your Supabase credentials from your Supabase project dashboard
3. Set up a MongoDB database (MongoDB Atlas is recommended)
4. Configure your n8n webhook URL

### 3. Authentication Issues
**Problem**: The app uses Supabase authentication with magic links.

**Solution**: 
1. Ensure your Supabase project is properly configured
2. Check that the redirect URLs are set correctly in your Supabase dashboard
3. Make sure your domain is allowed in the Supabase authentication settings

## How to Fix the n8n Workflow

### Option 1: Fix the Current n8n Workflow
1. Go to your n8n instance
2. Open the failing workflow
3. Check the "Message a model" node configuration
4. Verify your Google Gemini API key is correct
5. Check your API quota usage at https://ai.google.dev/
6. If quota is exceeded, wait for reset or upgrade your plan

### Option 2: Use the Fallback System
The app now includes a fallback system that will generate pitches even when n8n is unavailable. This ensures your app continues to work even during API issues.

### Option 3: Replace n8n with Direct API Calls
If you want to remove the dependency on n8n, you can modify the API route to call Google Gemini directly:

```typescript
// Add this to your route.ts file
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

async function generatePitchWithGemini(problem: string, solution: string, targetAudience?: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Create a compelling pitch based on the following information:
  
  Problem: ${problem}
  Solution: ${solution}
  Target Audience: ${targetAudience || 'General audience'}
  
  Please create a professional, engaging pitch that highlights the problem and solution.`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables in `.env.local`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Testing the Fix

1. Try creating a pitch through the web interface
2. The app should now work even if n8n is down (using fallback)
3. Check the console logs to see if fallback is being used
4. Verify that pitches are being saved to your MongoDB database

## Troubleshooting

- **"N8N Webhook URL is not configured"**: Add the `N8N_WEBHOOK_URL` to your `.env.local`
- **"Supabase URL and Anon Key are required"**: Add your Supabase credentials to `.env.local`
- **"MONGODB_URI environment variable"**: Add your MongoDB connection string to `.env.local`
- **Authentication errors**: Check your Supabase project configuration and redirect URLs 