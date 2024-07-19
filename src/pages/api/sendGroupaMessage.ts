import { NextApiRequest, NextApiResponse } from 'next';
import { sendGroupMessages } from '../../../twilio'; // Import the updated sendMessages function
import NextCors from 'nextjs-cors';

// Initialize CORS middleware
const corsMiddleware = async (req: NextApiRequest, res: NextApiResponse) => {
  await NextCors(req, res, {
    origin: "https://next-bin-iy3c59moo-esakkipandis-projects.vercel.app", // Replace with your client's domain
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
    const { recipients, body } = req.body; // Expecting 'recipients' as an array of phone numbers and 'body' as message

    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !body) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required parameters: recipients (array), body' });
    }

    try {
      // Send the SMS messages using Twilio
      const results = await sendGroupMessages(recipients, body);
      
      // Separate successful and failed messages
      const successfulResults = results.filter((result: any) => result.success);
      const failedResults = results.filter((result: any) => !result.success);

      res.status(200).json({
        successful: successfulResults.length,
        failed: failedResults.length,
        details: failedResults
      });
    } catch (error: any) {
      console.error('Twilio error:', error);

      let errorMessage = 'Failed to send messages. Please try again.';

      // Handle specific Twilio error codes
      if (error.code === 21211) {
        errorMessage = 'Invalid phone number. Please check the recipient numbers.';
      } else if (error.code === 21610) {
        errorMessage = 'Message body is empty. Please provide a message body.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(500).json({ error: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
