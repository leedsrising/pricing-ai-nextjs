import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Forward the request to backend
    const response = await axios.post(`${API_URL}/api/getPricing`, { url });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in getPricing:', error);
    res.status(500).json({ error: 'Error processing the request', details: error.message });
  }
}
