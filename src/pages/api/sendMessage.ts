// pages/api/sendMessage.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sendMessage } from '../../../twilio';
import NextCors from 'nextjs-cors';

// Initialize CORS middleware
const corsMiddleware = async (req: NextApiRequest, res: NextApiResponse) => {
  await NextCors(req, res, {
    origin: 'https://next-bin-app.vercel.app', // Replace with your client's domain
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  });
};

// Export the API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Wrap the handler with CORS middleware
  await corsMiddleware(req, res);

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
        errorMessage = error.message;
      }

      res.status(400).json({ error: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
