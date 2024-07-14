import { NextApiRequest, NextApiResponse } from 'next';
import { client2, sendWhatsAppMessage } from '../../../twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are allowed' });
  }

  const { to, message } = req.body;

  const { success, response, error } = await sendWhatsAppMessage(client2, to, message);

  if (success) {
    res.status(200).json({ success: true, response });
  } else {
    res.status(500).json({ success: false, error });
  }
}
