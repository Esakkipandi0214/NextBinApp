import twilio from 'twilio';
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken); 

const accountSid2 = process.env.TWILIO_ACCOUNT_SID_MY;
const authToken2 = process.env.TWILIO_AUTH_TOKEN_MY;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER_MY;
const client2 = twilio(accountSid2, authToken2);

const sendMessage = (to: string, body: string) => {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });
};

// Function to send WhatsApp message using the specified client
const sendWhatsAppMessage = async (client: twilio.Twilio, to: string, message: string) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${to}`,
    });
    return { success: true, response };
  } catch (error: any) { // Specify 'error' as 'any' type or 'Error' explicitly
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.message };
  }
};

export { sendMessage, sendWhatsAppMessage,client2 };
