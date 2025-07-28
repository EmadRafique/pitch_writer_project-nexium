// Simple test script to verify the API endpoint
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/generate-pitch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        title: 'Test Pitch',
        problem: 'Testing the API endpoint',
        solution: 'This is a test solution',
        targetAudience: 'Developers'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is working!');
      console.log('Response:', data);
    } else {
      const error = await response.text();
      console.log('❌ API error:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

testAPI(); 