import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { sendGroupWhatsAppMessage } from '../../../twilio'; // Import your Twilio function
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Initialize CORS middleware
  await NextCors(req, res, {
    origin: "https://next-bin-iy3c59moo-esakkipandis-projects.vercel.app", // Replace with your client's domain
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are allowed' });
  }

  const { recipients, message } = req.body; // Expecting 'recipients' as an array of phone numbers and 'message'

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !message) {
    return res.status(400).json({ error: 'Bad Request', message: 'Missing required parameters: recipients (array), message' });
  }

  try {
    // Send message to all recipients
    const results = await sendGroupWhatsAppMessage(recipients, message, true); // Pass the entire recipients array

    // Response object
    const successfulResults = results.filter((result: any) => result.success);
    const failedResults = results.filter((result: any) => !result.success);

    return res.status(200).json({
      successful: successfulResults.length,
      failed: failedResults.length,
      details: failedResults
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send WhatsApp messages. Please try again.';
    console.error('Error sending WhatsApp messages:', errorMessage);

    return res.status(500).json({ error: 'Internal Server Error', message: errorMessage });
  }
}
