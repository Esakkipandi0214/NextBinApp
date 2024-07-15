// pages/api/makeCall.ts
import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
import NextCors from 'nextjs-cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Initialize CORS middleware
  await NextCors(req, res, {
    origin:'https://next-bin-iy3c59moo-esakkipandis-projects.vercel.app', // Replace with your client's domain
    methods: ['POST'], // Specify allowed methods
    allowedHeaders: ['Content-Type'], // Specify allowed headers
    credentials: true, // Allow cookies and credentials to be sent cross-origin
  });

  // Continue with your API logic
  if (req.method === 'POST') {
    const { to } = req.body;

    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const sender = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !sender) {
        throw new Error('Twilio credentials or phone number not configured');
      }

      const client = twilio(accountSid, authToken);

      const call = await client.calls.create({
        twiml: '<Response><Say>Hello! This is a test call from your Twilio backend.</Say></Response>',
        to,
        from: sender, // Use a Twilio number you've purchased or verified
      });

      console.log('Call SID:', call.sid);
      return res.status(200).json({ message: 'Call initiated successfully!' });
    } catch (error: any) {
      console.error('Error making call:', error);
      let errorMessage = 'Failed to initiate call. Please try again.';

      // Handle specific Twilio error codes or messages if available
      if (error.message) {
        errorMessage = error.message;
      }

      return res.status(500).json({ error: 'Failed to initiate call', message: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
