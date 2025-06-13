import twilio from 'twilio';
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsappNumber = process.env.TWILIO_WATTSAPP_NUMBER_MY;

// Create a single client instance
const client = twilio(accountSid, authToken);

/**
 * Send a single SMS message
 */
const sendMessage = async (to: string, body: string) => {
  try {
    const formattedTo = formatPhoneNumber(to);
    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber!,
      to: formattedTo,
    });
    return { success: true, response: message };
  } catch (error: any) {
    console.error(`Error sending message to ${to}:`, error);
    return { 
      success: false, 
      error: error.message || 'Failed to send message',
      code: error.code
    };
  }
};

/**
 * Send SMS messages to multiple recipients
 */
/**
 * Send SMS messages to multiple recipients with region-specific providers
 */
const sendGroupMessages = async (recipients: string[], body: string) => {
  try {
    const results = await Promise.all(
      recipients.map(async (to) => {
        try {
          const formattedTo = formatPhoneNumber(to);
          const response = await client.messages.create({
            body,
            from: twilioPhoneNumber!,
            to: formattedTo,
            statusCallback: 'https://your-domain.com/api/messageStatus' // Add this line
          });
          return { 
            success: true, 
            to: formattedTo,
            response: {
              sid: response.sid,
              status: response.status,
              dateCreated: response.dateCreated,
              from: response.from,
              to: response.to,
              body: response.body,
              direction: response.direction,
              errorMessage: response.errorMessage,
              price: response.price,
              priceUnit: response.priceUnit
            }
          };
        } catch (error: any) {
          console.error(`Error sending message to ${to}:`, error);
          return { 
            success: false, 
            to, 
            error: error.message || 'Failed to send message',
            code: error.code
          };
        }
      })
    );
    
    return results;
  } catch (error: any) {
    console.error('Error sending messages:', error);
    throw error;
  }
};

/**
 * Send messages specifically to Australian numbers using alternative methods
 */
const sendMessagesToAustralia = async (recipients: string[], body: string) => {
  // Option 1: Use WhatsApp for Australian numbers if SMS fails
  // This requires the recipient to have WhatsApp installed
  if (twilioWhatsappNumber) {
    return Promise.all(
      recipients.map(async (to) => {
        try {
          // Try to send via WhatsApp
          const response = await client.messages.create({
            body: body + "\n\n(Sent via WhatsApp as SMS is unavailable)",
            from: `whatsapp:${twilioWhatsappNumber}`,
            to: `whatsapp:${to}`,
          });
          return { success: true, to, response, method: 'whatsapp' };
        } catch (whatsappError: any) {
          // If WhatsApp fails, use other alternatives or return error
          console.error(`WhatsApp message failed for ${to}:`, whatsappError);
          
          // Option 2: Email-to-SMS gateway if available
          // This would require an email service and knowing the carrier
          
          // Option 3: Use an alternative SMS provider specifically for Australia
          return await sendViaMsgMedia(to, body);
        }
      })
    );
  }
  
  // Fallback if WhatsApp number not configured
  return recipients.map(to => ({
    success: false,
    to,
    error: 'Geographic permissions for Australia not enabled and no alternative methods available',
    code: 'NO_AUS_METHOD'
  }));
};

/**
 * Example function to send via an Australian SMS provider like MessageMedia
 * This is a placeholder - you would need to implement the actual API calls
 */
const sendViaMsgMedia = async (to: string, body: string) => {
  // This is a placeholder for implementing an alternative SMS provider for Australia
  // You would need to add the actual API implementation here
  
  try {
    // Example implementation using fetch (you would replace with actual API)
    /*
    const response = await fetch('https://api.messagemedia.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from('YOUR_API_KEY:YOUR_API_SECRET').toString('base64')
      },
      body: JSON.stringify({
        messages: [{
          content: body,
          destination_number: to,
          format: 'SMS'
        }]
      })
    });
    
    const data = await response.json();
    return { success: true, to, response: data, method: 'messagemedia' };
    */
    
    // For now, return a mock success to show how it would work
    console.log(`Would send message to ${to} via MessageMedia: ${body}`);
    return { 
      success: false, 
      to, 
      error: 'Alternative Australian SMS provider not yet implemented',
      code: 'NEEDS_IMPLEMENTATION',
      suggestion: 'Implement MessageMedia or ClickSend integration for Australian numbers'
    };
  } catch (error: any) {
    console.error(`Error sending via alternative provider to ${to}:`, error);
    return { 
      success: false, 
      to, 
      error: error.message || 'Failed to send message via alternative provider',
      code: error.code || 'ALT_PROVIDER_ERROR'
    };
  }
};

/**
 * Send a single WhatsApp message
 */
const sendWhatsAppMessage = async (to: string, message: string) => {
  try {
    const formattedTo = formatPhoneNumber(to);
    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioWhatsappNumber}`,
      to: `whatsapp:${formattedTo}`,
    });
    return { success: true, response };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send message',
      code: error.code
    };
  }
};

/**
 * Send WhatsApp messages to multiple recipients
 */
const sendGroupWhatsAppMessage = async (recipients: string[], message: string) => {
  try {
    const results = await Promise.all(
      recipients.map(async (to) => {
        try {
          const formattedTo = formatPhoneNumber(to);
          const response = await client.messages.create({
            body: message,
            from: `whatsapp:${twilioWhatsappNumber}`,
            to: `whatsapp:${formattedTo}`,
          });
          return { success: true, to: formattedTo, response };
        } catch (error: any) {
          console.error(`Error sending WhatsApp message to ${to}:`, error);
          return { 
            success: false, 
            to, 
            error: error.message || 'Failed to send message',
            code: error.code
          };
        }
      })
    );

    return results;
  } catch (error: any) {
    console.error('Error sending WhatsApp messages:', error);
    return [{ success: false, error: error.message, code: error.code }];
  }
};

/**
 * Get country code from a phone number
 */
const getCountryCode = (phoneNumber: string): string => {
  if (phoneNumber.startsWith('+61')) return 'AU';
  if (phoneNumber.startsWith('+1')) return 'US';
  // Add more country codes as needed
  return 'UNKNOWN';
};

/**
 * Format a phone number to E.164 format
 */
const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove spaces and non-digit characters except +
  let formatted = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Ensure number starts with + and country code
  if (!formatted.startsWith('+')) {
    // For Australian numbers (formats like 0412345678)
    if (formatted.startsWith('0') && formatted.length === 10) {
      formatted = '+61' + formatted.substring(1);
    } 
    // For Australian numbers without leading 0 (formats like 412345678)
    else if (formatted.length === 9 && !formatted.startsWith('0') && !formatted.startsWith('1')) {
      formatted = '+61' + formatted;
    }
    // For US numbers without country code
    else if (!formatted.startsWith('1') && formatted.length === 10) {
      formatted = '+1' + formatted;
    }
    // Otherwise just add + assuming country code is included
    else {
      formatted = '+' + formatted;
    }
  }
  
  return formatted;
};

export { sendMessage, sendGroupMessages, sendWhatsAppMessage, sendGroupWhatsAppMessage };