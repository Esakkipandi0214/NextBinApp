// utils/twilio.ts
import twilio from 'twilio';
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const defaultPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const accountSid2 = process.env.TWILIO_ACCOUNT_SID_MY;
const authToken2 = process.env.TWILIO_AUTH_TOKEN_MY;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER_MY;
const twilioWattsappNumber = process.env.TWILIO_WATTSAPP_NUMBER_MY;

const client = twilio(accountSid, authToken);
const client2 = twilio(accountSid2, authToken2);

const sendMessage = (to: string, body: string,useClient2: boolean = false) => {
  const selectedClient = client2;
  return selectedClient.messages.create({
    body,
    from: twilioPhoneNumber!,
    to,
  });
};
const sendGroupMessages = async (recipients: string[], body: string, useClient2: boolean = false) => {
  const selectedClient = client2;// Choose the client based on useClient2 flag

  try {
    // Send messages to all recipients
    const results = await Promise.all(
      recipients.map(async (to) => {
        try {
          const response = await selectedClient.messages.create({
            body,
            from: twilioPhoneNumber!,
            to,
          });
          return { success: true, to, response };
        } catch (error: any) {
          console.error(`Error sending message to ${to}:`, error);
          return { success: false, to, error: error.message || 'Failed to send message' };
        }
      })
    );

    // Return results with successful and failed messages
    return results;
  } catch (error: any) {
    console.error('Error sending messages:', error);
    throw new Error('Failed to send messages. Please try again.');
  }
};


const sendWhatsAppMessage = async (to: string, message: string, useClient2: boolean = false) => {
  const selectedClient = client2;
 

  try {
    const response = await selectedClient.messages.create({
      body: message,
      from: `whatsapp:${twilioWattsappNumber}`, // Use the specific WhatsApp number
      to: `whatsapp:${to}`,
    });
    return { success: true, response };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.message };
  }
};

const sendGroupWhatsAppMessage = async (recipients: string[], message: string, useClient2: boolean = false) => {
  const selectedClient = client2;

  try {
    // Send message to each recipient
    const results = await Promise.all(
      recipients.map(async (to) => {
        try {
          const response = await selectedClient.messages.create({
            body: message,
            from: `whatsapp:${twilioWattsappNumber}`,
            to: `whatsapp:${to}`,
          });
          return { success: true, to, response };
        } catch (error: any) {
          console.error(`Error sending WhatsApp message to ${to}:`, error);
          return { success: false, to, error: error.message };
        }
      })
    );

    return results;
  } catch (error: any) {
    console.error('Error sending WhatsApp messages:', error);
    return [{ success: false, error: error.message }];
  }
};


export { sendMessage,sendGroupMessages, sendWhatsAppMessage,sendGroupWhatsAppMessage };

