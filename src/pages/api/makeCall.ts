// pages/api/makeCall.ts
import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
// pages/api/sendMessageTwilio.js or pages/index.js (example)

require('dotenv').config();



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { to } = req.body;

    const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
    const authToken = process.env.TWILIO_AUTH_TOKEN as string;
    const Sender = process.env.TWILIO_PHONE_NUMBER as string;
    const client = twilio(accountSid, authToken);

    try {
      const call = await client.calls.create({
        twiml: `<Response><Say>Hello! This is a test call from your Twilio backend.</Say></Response>`,
        to,
        from: `${Sender}`, // Use a Twilio number you've purchased or verified
      });

      console.log('Call SID:', call.sid);
      res.status(200).json({ message: 'Call initiated successfully!' });
    } catch (error) {
      console.error('Error making call:', error);
      res.status(500).json({ error: 'Failed to initiate call' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
