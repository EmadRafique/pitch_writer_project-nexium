require('dotenv').config({ path: '.env.local' });

// Test script to debug n8n webhook connection
const testN8nConnection = async () => {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  
  if (!N8N_WEBHOOK_URL) {
    console.log('❌ N8N_WEBHOOK_URL is not configured');
    console.log('Please add N8N_WEBHOOK_URL to your .env.local file');
    return;
  }

  console.log('🔍 Testing n8n webhook connection...');
  console.log('Webhook URL:', N8N_WEBHOOK_URL);

  const testPayload = {
    problem: "Students struggle with time management",
    solution: "AI-powered study planner app",
    targetAudience: "College students"
  };

  try {
    console.log('📤 Sending test payload:', testPayload);
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ n8n error response:', errorText);
      
      // Common error analysis
      if (response.status === 404) {
        console.log('💡 Suggestion: Check if the webhook URL is correct');
      } else if (response.status === 500) {
        console.log('💡 Suggestion: Check your n8n workflow configuration');
      } else if (errorText.includes('quota')) {
        console.log('💡 Suggestion: Upgrade your Google Gemini API plan');
      }
    } else {
      const responseText = await response.text();
      console.log('✅ n8n response successful!');
      console.log('📄 Response length:', responseText.length);
      console.log('📄 Response preview:', responseText.substring(0, 200));
      
      if (responseText.trim() === '') {
        console.log('⚠️  Warning: Empty response from n8n');
      }
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('💡 Suggestion: Check if your n8n instance is running');
  }
};

// Test direct Gemini API if configured
const testGeminiAPI = async () => {
  const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!GOOGLE_GEMINI_API_KEY) {
    console.log('❌ GOOGLE_GEMINI_API_KEY is not configured');
    return;
  }

  console.log('\n🔍 Testing direct Gemini API...');
  
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const prompt = "Create a short test pitch about AI-powered study tools.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('✅ Direct Gemini API working!');
    console.log('📄 Test response:', response.text().substring(0, 100));
    
  } catch (error) {
    console.log('❌ Direct Gemini API error:', error.message);
    
    if (error.message.includes('quota')) {
      console.log('💡 Suggestion: Upgrade your Google Gemini API plan');
    } else if (error.message.includes('key')) {
      console.log('💡 Suggestion: Check your API key');
    } else if (error.message.includes('model')) {
      console.log('💡 Suggestion: Check the model name - using gemini-2.5-pro');
    }
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting n8n and AI connection tests...\n');
  
  await testN8nConnection();
  await testGeminiAPI();
  
  console.log('\n📋 Summary:');
  console.log('- If n8n test failed: Check your n8n workflow and webhook URL');
  console.log('- If Gemini test failed: Check your API key and quota');
  console.log('- The app will use fallback if both fail');
};

runTests();