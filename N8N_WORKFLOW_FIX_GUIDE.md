# Fix Your n8n Workflow - Get Real AI Content

## 🚨 Current Problem
Your n8n workflow is returning template variables like `{{ $json.content }}` instead of real AI-generated content.

## 🔧 How to Fix Your n8n Workflow

### Step 1: Check Your "Message a Model" Node

1. **Go to your n8n workflow**
2. **Click on the "Message a model" node**
3. **Check these settings:**

#### Required Settings:
```json
{
  "model": "gemini-2.5-pro",
  "prompt": "Create a compelling pitch based on the following information:\n\nProblem: {{ $json.problem }}\nSolution: {{ $json.solution }}\nTarget Audience: {{ $json.targetAudience || 'General audience' }}\n\nPlease create a professional, engaging pitch that highlights the problem and solution. Format with clear sections.",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

### Step 2: Fix Your "Respond to Webhook" Node

**This is the most important part!**

1. **Click on the "Respond to Webhook" node**
2. **Change the response body to:**
   ```
   {{ $json.text }}
   ```
   **NOT** `{{ $json.content }}` or `{"pitch":"{{ $json.content }}"}`

3. **Set Content Type to:** `text/plain`

### Step 3: Test Your Workflow

1. **Click "Execute workflow"** in n8n
2. **Use this test data:**
   ```json
   {
     "problem": "Students struggle with time management",
     "solution": "AI-powered study planner app",
     "targetAudience": "College students"
   }
   ```
3. **Check the output** - Should show real AI content, not template variables

## 🎯 Expected Results

### ✅ If Fixed:
- **Real AI content** like: "Here's a compelling pitch for college students..."
- **No template variables** like `{{ $json.content }}`
- **Professional pitch** with proper formatting

### ❌ If Still Broken:
- **Template variables** like `{{ $json.content }}`
- **JSON strings** like `{"pitch":"{{ $json.content }}"}`
- **Empty content**

## 🔍 Debugging Steps

### Check n8n Logs:
1. **Open your n8n workflow**
2. **Click on "Message a model" node**
3. **Check execution history**
4. **Look for error messages**

### Common Issues:
- **Wrong model name** - Use `gemini-2.5-pro`
- **Invalid API key** - Check your Gemini API key
- **Wrong response format** - Use `{{ $json.text }}` not `{{ $json.content }}`
- **Quota exceeded** - Check your API quota

## 🚀 Quick Test

After fixing your n8n workflow:

1. **Test in n8n first** - Execute workflow manually
2. **Test via web app** - Create a pitch
3. **Check the result** - Should see real AI content

## 📞 If Still Not Working

If you still see template variables after fixing n8n:

1. **Use direct Gemini API** - The app will automatically fall back
2. **Check your API quota** - Make sure you haven't exceeded limits
3. **Try a new API key** - Create a fresh Gemini API key

## 🎯 Priority

**Fix your n8n "Respond to Webhook" node first** - this is the most common cause of the template variable issue! 