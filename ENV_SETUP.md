# Environment Variables Setup Guide

## Current Issue
Your `.env.local` file is missing the required environment variables. This is why the AI features aren't working.

## Required Environment Variables

Create or update your `.env.local` file in the project root with these variables:

```env
# Supabase Configuration (Required for Authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# MongoDB Configuration (Required for Database)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# n8n Webhook URL (Required for AI via n8n)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# Google Gemini API Key (Optional - backup for direct AI)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

## How to Get These Values

### 1. Supabase Configuration
1. Go to [Supabase](https://supabase.com/)
2. Create a new project or use existing one
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

### 2. MongoDB Configuration
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

### 3. n8n Webhook URL
1. Go to your n8n instance
2. Open your workflow
3. Click on the Webhook node
4. Copy the webhook URL
5. Make sure the workflow is active

### 4. Google Gemini API Key (Optional)
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Create a new API key
3. Copy the key (starts with "AIza...")

## Quick Setup Steps

### Step 1: Create .env.local
```bash
# In your project root
touch .env.local
```

### Step 2: Add the variables
Copy the template above and replace the placeholder values with your actual credentials.

### Step 3: Test the configuration
```bash
node test-n8n.js
```

### Step 4: Restart the development server
```bash
npm run dev
```

## Testing Your Setup

After setting up the environment variables:

1. **Test n8n connection:**
   ```bash
   node test-n8n.js
   ```

2. **Test the web application:**
   - Go to http://localhost:3000
   - Try creating a pitch
   - Check the console logs for detailed information

3. **Check which system is being used:**
   - Blue banner = n8n workflow
   - Green banner = direct Gemini API
   - Yellow banner = fallback template

## Troubleshooting

### If n8n test fails:
- Check if your n8n instance is running
- Verify the webhook URL is correct
- Make sure the workflow is active
- Check the n8n execution logs

### If Gemini test fails:
- Verify your API key is correct
- Check if you've exceeded your quota
- Try creating a new API key

### If MongoDB fails:
- Check your connection string
- Verify your database password
- Make sure your IP is whitelisted in MongoDB Atlas

## Priority Order

The app will try these methods in order:
1. **n8n workflow** (if `N8N_WEBHOOK_URL` is set)
2. **Direct Gemini API** (if `GOOGLE_GEMINI_API_KEY` is set)
3. **Fallback template** (always available)

## Security Notes

- Never commit `.env.local` to version control
- Use strong passwords for MongoDB
- Keep your API keys secure
- Consider using environment variables in production

## Next Steps

1. Set up your environment variables
2. Test the connections
3. Fix any issues identified
4. Deploy to Vercel with the same environment variables 