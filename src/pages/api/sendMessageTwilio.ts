// Example usage in an API route
import { NextApiRequest, NextApiResponse } from 'next';
import { sendMessage, sendWhatsAppMessage } from '../../../twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are allowed' });
  }

  const { type, to, message } = req.body;

  try {
    if (type === 'sms') {
      const result = await sendMessage(to, message);
      return res.status(200).json(result);
    } else if (type === 'whatsapp') {
      const result = await sendWhatsAppMessage(to, message, true); // Use client2 for WhatsApp
      return res.status(200).json(result);
    } else {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid message type' });
    }
  } catch (error: any) { // Explicitly type 'error' to 'any' or 'Error'
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
