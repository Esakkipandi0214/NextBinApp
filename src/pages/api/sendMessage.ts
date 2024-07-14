import { NextApiRequest, NextApiResponse } from 'next';
import { sendMessage } from '../../../twilio';
require('dotenv').config();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { to, body } = req.body;
  
  
  try {
    // Send the SMS message using Twilio
    const message = await sendMessage(to, body);
    
    res.status(200).json({ message });
  } catch (error: any) {
    console.error('Twilio error:', error); // Log the entire error object for debugging
    
    // Handle specific error cases if known, otherwise default to a generic message
    let errorMessage = 'Failed to send message. Please try again.';
    
    // Check if the error has a specific code or message to differentiate errors
    if (error.code === 21211) {
      errorMessage = 'Invalid phone number. Please check the recipient number.';
    } else if (error.code === 21610) {
      errorMessage = 'Message body is empty. Please provide a message body.';
    } else if (error.message) {
      // Log the error message if available for additional context
      console.error('Twilio error message:', error.message);
    }
    
    res.status(400).json({ error: errorMessage });
  }
};
