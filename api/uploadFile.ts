// api/uploadFile.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import FormData from 'form-data';
import fetch from 'node-fetch';

const uploadFileHandler = async (req: VercelRequest, res: VercelResponse) => {
  const LANGFLOW_BASE_URL = process.env.LANGFLOW_BASE_URL;
  const APPLICATION_TOKEN = process.env.APPLICATION_TOKEN;

  if (!LANGFLOW_BASE_URL || !APPLICATION_TOKEN) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    if (!req.body || !req.body.file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    const formData = new FormData();
    formData.append('file', req.body.file);

    const response = await fetch(`${LANGFLOW_BASE_URL}/api/v1/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${APPLICATION_TOKEN}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('LangFlow API Error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('File upload error:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'File upload failed.' });
  }
};

export default uploadFileHandler;
