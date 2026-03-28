export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const KEY = process.env.GROQ_KEY;
  if (!KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }
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
    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = (errJson.error && errJson.error.message) ? errJson.error.message : 'HTTP ' + response.status;
      return res.status(response.status).json({ error: errMsg });
    }
    const data = await response.json();
    const content = data.choices[0].message.content || '';
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
```

Then scroll down → commit message:
```
Add Vercel API function for secure key
```
Click **Commit changes** ✅

---

## STEP 2 — Upload new index.html

1. Go back to your repo main page
2. Click **Add file** → **Upload files**
3. Upload the `index.html` I gave you
4. Commit message:
```
Remove hardcoded API key - use Vercel function
