import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Safety check: Ensure we don't crash if body is missing
  const body = req.body || {};
  const userId = body.userId;

  const apiKey = process.env.OPENAI_API_KEY;
  const workflowId = process.env.CHATKIT_WORKFLOW_ID;
  const projectId = process.env.OPENAI_PROJECT_ID;

  if (!apiKey || !workflowId) {
    return res.status(500).json({ error: 'Missing API Key or Workflow ID in Environment' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Authorization': `Bearer ${apiKey}`,
        ...(projectId ? { 'OpenAI-Project': projectId } : {}),
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        // Use the passed userId, fallback to the old shared one if missing
        user: userId || 'skillport-web', 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json({ client_secret: data.client_secret });
  } catch (err: any) {
    console.error('Session Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
