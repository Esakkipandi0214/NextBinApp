// Import necessary modules
import { NextApiRequest, NextApiResponse } from 'next';
import cors from 'cors';
import { sendWhatsAppMessage } from '../../../twilio'; // Assuming this imports your Twilio WhatsApp function

// Initialize the CORS middleware
const corsMiddleware = cors({
  origin: 'http://your-client-domain.com', // Replace with your client's domain
  methods: ['POST'], // Specify allowed methods
  allowedHeaders: ['Content-Type'], // Specify allowed headers
  credentials: true, // Allow cookies and credentials to be sent cross-origin
});

// Handler function for the API route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply the CORS middleware to handle preflight requests and CORS headers
  await new Promise<void>((resolve, reject) => {
    corsMiddleware(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are allowed' });
  }

  const { to, message } = req.body; // Assuming 'to' and 'message' are required for WhatsApp

  try {
    const result = await sendWhatsAppMessage(to, message, true); // Use client2 for WhatsApp
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
