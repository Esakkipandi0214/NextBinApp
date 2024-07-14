// pages/api/sendWhatsAppMessage.ts
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { sendWhatsAppMessage } from '../../../twilio'; // Assuming this imports your Twilio WhatsApp function
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Initialize CORS middleware
  await NextCors(req, res, {
    origin: 'https://next-bin-app.vercel.app', // Replace with your client's domain
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are allowed' });
  }

  const { to, message } = req.body; // Assuming 'to' and 'message' are required for WhatsApp

  if (!to || !message) {
    return res.status(400).json({ error: 'Bad Request', message: 'Missing required parameters: to, message' });
  }

  try {
    const result = await sendWhatsAppMessage(to, message, true); // Use client2 for WhatsApp
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    let errorMessage = 'Failed to send WhatsApp message. Please try again.';

    if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({ error: 'Internal Server Error', message: errorMessage });
  }
}
