// utils/twilio.ts
import twilio from 'twilio';
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const defaultPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const accountSid2 = process.env.TWILIO_ACCOUNT_SID_MY;
const authToken2 = process.env.TWILIO_AUTH_TOKEN_MY;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER_MY;

const client = twilio(accountSid, authToken);
const client2 = twilio(accountSid2, authToken2);

const sendMessage = (to: string, body: string) => {
  return client.messages.create({
    body,
    from: defaultPhoneNumber!,
    to,
  });
};

const sendWhatsAppMessage = async (to: string, message: string, useClient2: boolean = false) => {
  const selectedClient = useClient2 ? client2 : client;

  try {
    const response = await selectedClient.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`, // Use the specific WhatsApp number
      to: `whatsapp:${to}`,
    });
    return { success: true, response };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.message };
  }
};

export { sendMessage, sendWhatsAppMessage };
