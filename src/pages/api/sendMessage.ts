// pages/api/sendMessage.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sendMessage } from '../../../twilio';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: 'https://next-bin-app.vercel.app', // Replace with your client's domain
  methods: ['POST'], // Specify allowed methods
  allowedHeaders: ['Content-Type'], // Specify allowed headers
  credentials: true, // Allow cookies and credentials to be sent cross-origin
});

// Export the API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Wrap the handler with CORS middleware
  await new Promise<void>((resolve, reject) => {
    corsMiddleware(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // Continue with your API logic
  if (req.method === 'POST') {
    const { to, body } = req.body;

    try {
      // Send the SMS message using Twilio
      const message = await sendMessage(to, body);
      res.status(200).json({ message });
    } catch (error: any) {
      console.error('Twilio error:', error);

      let errorMessage = 'Failed to send message. Please try again.';

      // Handle specific Twilio error codes
      if (error.code === 21211) {
        errorMessage = 'Invalid phone number. Please check the recipient number.';
      } else if (error.code === 21610) {
        errorMessage = 'Message body is empty. Please provide a message body.';
      } else if (error.message) {
        console.error('Twilio error message:', error.message);
      }

      res.status(400).json({ error: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
