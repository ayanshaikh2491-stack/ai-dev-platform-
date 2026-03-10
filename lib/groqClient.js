const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'llama-3.3-70b-versatile',
  temperature: number = 0.5
): Promise<string> {
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
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Groq API error');
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Groq API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error(`AI Processing Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
