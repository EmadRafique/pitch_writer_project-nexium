# Fix Your n8n Workflow - Empty Response Issue

## Current Problem
Your n8n webhook is responding with status 200 but returning empty content (Response length: 0). This means the workflow is not properly configured.

## Step-by-Step Fix

### 1. Check Your n8n Workflow Structure

Your workflow should have these nodes in order:
1. **Webhook** (Trigger) - ✅ Working (returns 200)
2. **Message a model** (Google Gemini) - ❌ Not working properly
3. **Respond to Webhook** - ❌ Not configured correctly

### 2. Fix the "Message a Model" Node

1. **Open your n8n workflow**
2. **Click on the "Message a model" node**
3. **Check the configuration:**

#### Required Settings:
```json
{
  "model": "gemini-1.5-pro",
  "prompt": "Create a compelling pitch based on the following information:\n\nProblem: {{ $json.problem }}\nSolution: {{ $json.solution }}\nTarget Audience: {{ $json.targetAudience || 'General audience' }}\n\nPlease create a professional, engaging pitch that highlights the problem and solution. Format with clear sections.",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

#### Common Issues to Check:
- **API Key**: Make sure your Google Gemini API key is set correctly
- **Model Name**: Use `gemini-1.5-pro` (not `gemini-pro`)
- **Prompt**: Make sure the prompt uses the correct variables
- **Quota**: Check if you've exceeded your API quota

### 3. Fix the "Respond to Webhook" Node

1. **Click on the "Respond to Webhook" node**
2. **Configure it like this:**

```json
{
  "responseCode": 200,
  "responseBody": "{{ $json.text }}",
  "options": {
    "responseHeaders": {
      "Content-Type": "text/plain"
    }
  }
}
```

### 4. Test Your Workflow Manually

1. **Go to your n8n workflow**
2. **Click "Execute workflow"**
3. **Use this test data:**
```json
{
  "problem": "Students struggle with time management",
  "solution": "AI-powered study planner app",
  "targetAudience": "College students"
}
```
4. **Check the execution logs for errors**

### 5. Common n8n Configuration Issues

#### Issue 1: Wrong Response Format
**Problem**: n8n returns JSON but your app expects plain text
**Solution**: Change the "Respond to Webhook" node to return plain text

#### Issue 2: Missing API Key
**Problem**: Google Gemini API key not configured in n8n
**Solution**: Add your API key in the "Message a model" node settings

#### Issue 3: Wrong Model Name
**Problem**: Using old model name
**Solution**: Use `gemini-1.5-pro` instead of `gemini-pro`

#### Issue 4: Quota Exceeded
**Problem**: API quota limit reached
**Solution**: Upgrade your Google Gemini API plan or wait for reset

### 6. Alternative: Use Direct Gemini API

Since your Gemini API quota is exceeded, you can:

1. **Add your Gemini API key to `.env.local`:**
```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

2. **The app will automatically use direct Gemini API** instead of n8n
3. **This bypasses the n8n workflow entirely**

### 7. Test the Fix

After fixing your n8n workflow:

1. **Test manually in n8n:**
   - Execute the workflow
   - Check that it returns actual content

2. **Test via API:**
```bash
node test-n8n.js
```

3. **Test via web app:**
   - Go to http://localhost:3000
   - Try creating a pitch
   - Check the console logs

### 8. Debugging Steps

#### Check n8n Logs:
1. Open your n8n workflow
2. Click on each node
3. Check the execution history
4. Look for error messages

#### Check API Quota:
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Check your current usage
3. See when quota resets

#### Check Webhook URL:
1. Verify the webhook URL in your `.env.local`
2. Make sure the workflow is active
3. Test the webhook directly

### 9. Emergency Solution

If you can't fix n8n immediately:
1. The app will use fallback generation
2. Users can still create pitches
3. You can fix n8n later without downtime

### 10. Quick Fix Checklist

- [ ] Check n8n workflow configuration
- [ ] Verify Google Gemini API key in n8n
- [ ] Use correct model name (`gemini-1.5-pro`)
- [ ] Configure "Respond to Webhook" node properly
- [ ] Test workflow manually
- [ ] Check API quota usage
- [ ] Test via web application

## Expected Results

After fixing:
- ✅ n8n should return actual pitch content
- ✅ Response length should be > 0
- ✅ Web app should show blue banner (n8n working)
- ✅ No more yellow fallback banner 