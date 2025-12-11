// frontend/api/create-session.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const workflowId = process.env.CHATKIT_WORKFLOW_ID; // we’ll set this in Vercel
  const projectId = process.env.OPENAI_PROJECT_ID;    // optional, only if you use Projects

  if (!apiKey || !workflowId) {
    res.status(500).json({ error: 'Server is missing OPENAI_API_KEY or CHATKIT_WORKFLOW_ID' });
    return;
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
        user: 'skillport-web', // you can later pass a real user/device id here
      }),
    });

    const bodyText = await response.text();

    if (!response.ok) {
      // Pass through the OpenAI error for debugging
      res.status(response.status).json({ error: bodyText });
      return;
    }

    const data = JSON.parse(bodyText) as { client_secret?: string };

    if (!data.client_secret) {
      res.status(500).json({ error: 'No client_secret returned from OpenAI' });
      return;
    }

    // This is exactly what your frontend expects
    res.status(200).json({ client_secret: data.client_secret });
  } catch (err: any) {
    console.error('Error creating ChatKit session:', err);
    res.status(500).json({ error: 'Failed to create ChatKit session' });
  }
}
