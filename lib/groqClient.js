// lib/groqClient.js

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function callGroq(
  systemPrompt,
  userPrompt,
  model = 'llama-3.3-70b-versatile',
  temperature = 0.5
) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 8192,
        temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Groq API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error(`AI Processing Failed: ${error.message}`);
  }
}
