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
    origin: 'https://next-bin-iy3c59moo-esakkipandis-projects.vercel.app', // Replace with your client's domain
    methods: ['POST'], // Specify allowed methods
    allowedHeaders: ['Content-Type'], // Specify allowed headers
    credentials: true, // Allow cookies and credentials to be sent cross-origin
  });

  // Continue with your API logic
  if (req.method === 'POST') {
    const { toNumbers } = req.body; // Expecting an array of phone numbers

    if (!Array.isArray(toNumbers) || toNumbers.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing or invalid parameter: toNumbers' });
    }

    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID_MY;
      const authToken = process.env.TWILIO_AUTH_TOKEN_MY;
      const sender = process.env.TWILIO_PHONE_NUMBER_MY;

      if (!accountSid || !authToken || !sender) {
        throw new Error('Twilio credentials or phone number not configured');
      }

      const client = twilio(accountSid, authToken);

      // Initiate calls to each number
      const callPromises = toNumbers.map(async (to: string) => {
        try {
          const call = await client.calls.create({
            twiml: '<Response><Say>Hello! This is a test call from your Twilio backend.</Say></Response>',
            to,
            from: sender, // Use a Twilio number you've purchased or verified
          });
          console.log('Call SID:', call.sid);
          return { to, sid: call.sid, status: 'success' };
        } catch (error: any) {
          console.error(`Error making call to ${to}:`, error);
          return { to, error: error.message || 'Failed to make call', status: 'failed' };
        }
      });

      // Wait for all call promises to resolve
      const results = await Promise.all(callPromises);

      // Separate successful and failed calls
      const successfulCalls = results.filter(result => result.status === 'success');
      const failedCalls = results.filter(result => result.status === 'failed');

      // Response object
      return res.status(200).json({
        message: 'Calls initiated',
        successful: successfulCalls.length,
        failed: failedCalls.length,
        details: failedCalls,
      });

    } catch (error: any) {
      console.error('Error initiating calls:', error);
      let errorMessage = 'Failed to initiate calls. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      return res.status(500).json({ error: 'Failed to initiate calls', message: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
