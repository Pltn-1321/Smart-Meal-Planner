import { config } from 'dotenv';
config({ path: './.env.local' });

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "mistralai/ministral-8b";

async function testOpenRouter() {
  console.log('🔍 Testing OpenRouter API connection...');
  console.log('📝 API Key configured:', process.env.OPENROUTER_API_KEY ? 'Yes' : 'No');
  console.log('🤖 Model:', MODEL);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "Smart-Meal-Planner-Test",
        "X-Title": "Smart Meal Planner Test",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant. Respond with a simple JSON object." },
          { role: "user", content: "Say hello and return JSON: {\"message\": \"Hello, world!\", \"status\": \"success\"}" }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success! Response:', JSON.stringify(data, null, 2));

    const content = data.choices[0]?.message?.content || data.choices[0]?.text;
    if (content) {
      console.log('📄 Content:', content);
      try {
        const parsed = JSON.parse(content);
        console.log('🧩 Parsed JSON:', parsed);
      } catch (e) {
        console.warn('⚠️ Content is not valid JSON');
      }
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testOpenRouter();
