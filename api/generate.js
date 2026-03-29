export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const KEY = process.env.GROQ_KEY || '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';
  if (!KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON API. You ONLY output raw valid JSON. Never output markdown code fences, never add text before or after the JSON object. Your entire response must start with { and end with }.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 4096
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = (data.error && data.error.message) ? data.error.message : 'HTTP ' + response.status;
      return res.status(response.status).json({ error: errMsg });
    }

    const content = data.choices[0].message.content || '';
    return res.status(200).json({ content });

  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
