import { useState } from 'react';

const defaultPhoneNumber = '+918925722979'; // Replace with your desired default phone number

const SendMessageForm = () => {
  const [to, setTo] = useState(defaultPhoneNumber);
  const [body, setBody] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          body,
          customerName,
          customerEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Invalid phone number. Please check the recipient number.') {
          setError('Invalid phone number. Please check the recipient number.');
        } else {
          throw new Error(errorData.error || 'Failed to send message. Please try again.');
        }
      } else {
        const responseData = await response.json();
        console.log(responseData);
        setSuccess(true);
        setError(null);
        // Clear form fields upon success (optional)
        setTo(defaultPhoneNumber); // Reset to default phone number after success
        setBody('');
        setCustomerName('');
        setCustomerEmail('');
      }
    } catch (error: any) {
      console.error('Fetch Error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
      setSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
      {error && (
        <div className="text-red-500 mb-4 px-4 py-2 rounded bg-red-100">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-500 mb-4 px-4 py-2 rounded bg-green-100">
          Message sent successfully!
        </div>
      )}
      <input
        type="text"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Customer Name"
        required
        className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="email"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        placeholder="Customer Email"
        required
        className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Recipient Phone Number"
        required
        className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Message"
        required
        className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
        Send Message
      </button>
    </form>
  );
};

export default SendMessageForm;
