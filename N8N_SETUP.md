# n8n Workflow Setup Guide

## Current Issue
Your n8n workflow is failing because the Google Gemini API quota has been exceeded. Here's how to fix it:

## Step 1: Check Your n8n Workflow

### Current Workflow Structure (from the image):
1. **Webhook Node** (Trigger) - ✅ Working
2. **Message a model Node** (Google Gemini) - ❌ Failing due to quota
3. **Respond to Webhook Node** - ✅ Working

## Step 2: Fix the Google Gemini API Quota Issue

### Option A: Upgrade Your Google Gemini API Plan
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Check your current usage and quota
3. Upgrade to a paid plan if needed
4. Update your API key in n8n

### Option B: Use a Different API Key
1. Create a new Google Cloud project
2. Enable the Gemini API
3. Generate a new API key
4. Update the key in your n8n workflow

### Option C: Wait for Quota Reset
- Free tier quotas usually reset monthly
- Check your quota reset date in Google AI Studio

## Step 3: Configure Your n8n Workflow

### Webhook Node Configuration:
```json
{
  "httpMethod": "POST",
  "path": "your-webhook-path",
  "responseMode": "responseNode"
}
```

### Message a Model Node Configuration:
```json
{
  "model": "gemini-pro",
  "prompt": "Create a compelling pitch based on the following information:\n\nProblem: {{ $json.problem }}\nSolution: {{ $json.solution }}\nTarget Audience: {{ $json.targetAudience || 'General audience' }}\n\nPlease create a professional, engaging pitch that highlights the problem and solution. Format with clear sections.",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

### Respond to Webhook Node Configuration:
```json
{
  "responseCode": 200,
  "responseBody": "{{ $json.text }}"
}
```

## Step 4: Test Your n8n Workflow

### Manual Test:
1. Go to your n8n instance
2. Open the workflow
3. Click "Execute workflow"
4. Check the execution logs for errors

### API Test:
```bash
curl -X POST "YOUR_N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Students need better study tools",
    "solution": "AI-powered study assistant",
    "targetAudience": "College students"
  }'
```

## Step 5: Environment Variables

Make sure your `.env.local` has the correct n8n webhook URL:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

## Step 6: Alternative Solutions

### If n8n continues to fail, the app will automatically:
1. Try direct Gemini API (if `GOOGLE_GEMINI_API_KEY` is set)
2. Use fallback template generation
3. Show appropriate status messages to users

## Step 7: Debugging

### Check n8n Logs:
1. Open your n8n workflow
2. Click on the "Message a model" node
3. Check the execution history
4. Look for specific error messages

### Common Errors:
- **"You exceeded your current quota"** → Upgrade API plan
- **"Invalid API key"** → Check your Gemini API key
- **"Rate limit exceeded"** → Wait or upgrade plan
- **"Model not found"** → Use "gemini-pro" model name

## Step 8: Monitoring

The enhanced API now provides detailed logging:
- Console logs show which system is being used
- Response includes `usedFallback`, `usedDirectGemini`, and `n8nError` fields
- Frontend shows different colored banners for each method

## Quick Fix Checklist:

- [ ] Check Google Gemini API quota usage
- [ ] Verify n8n webhook URL in `.env.local`
- [ ] Test n8n workflow manually
- [ ] Check n8n execution logs
- [ ] Verify API key in n8n workflow
- [ ] Test the full application flow

## Emergency Fallback

If you can't fix the n8n workflow immediately:
1. The app will use fallback generation
2. Users can still create pitches
3. You can fix n8n later without downtime
4. The app will automatically switch back to n8n when fixed 