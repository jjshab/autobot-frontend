// api/runFlow.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

interface FlowRequestBody {
  flowIdOrName: string;
  langflowId: string;
  inputValue: unknown;
  inputType: string;
  outputType: string;
  tweaks?: Record<string, unknown>;
}

interface FlowResponse {
  error?: string;
  [key: string]: unknown;
}

export default async function runFlow(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const {
    flowIdOrName,
    langflowId,
    inputValue,
    inputType,
    outputType,
    tweaks,
  } = req.body as FlowRequestBody;

  const LANGFLOW_BASE_URL = process.env.LANGFLOW_BASE_URL;
  const APPLICATION_TOKEN = process.env.APPLICATION_TOKEN;

  if (!LANGFLOW_BASE_URL || !APPLICATION_TOKEN) {
    res.status(500).json({ error: 'Server configuration error.' });
    return;
  }

  const headers = {
    Authorization: `Bearer ${APPLICATION_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const endpoint = `/lf/${langflowId}/api/v1/run/${flowIdOrName}`;
  const url = `${LANGFLOW_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input_value: inputValue,
        input_type: inputType,
        output_type: outputType,
        tweaks,
      }),
    });

    const data = (await response.json()) as FlowResponse;

    if (!response.ok) {
      console.error('Error from LangFlow API:', data);
      res.status(response.status).json(data);
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error running flow:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ error: 'Error running flow.' });
  }
}
