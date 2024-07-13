import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

interface Message {
  body: string;
  timestamp: {
    toMillis: () => number;
  };
  customer: {
    name: string;
    email: string;
  };
}

const MessageList = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Explicitly define the state type

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesSnapshot = await getDocs(collection(db, 'messages'));
        const messagesData = await Promise.all(messagesSnapshot.docs.map(async (doc) => {
          const messageData = doc.data();
          const customerRef = messageData.customerId;
          const customerSnapshot = await getDocs(query(collection(db, 'customers'), where('id', '==', customerRef)));
          const customerData = customerSnapshot.docs[0]?.data() || {};
          return { ...messageData, customer: customerData } as Message;
        }));
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <ul>
      {messages.map((message, index) => (
        <li key={index}>
          <p><strong>Customer:</strong> {message.customer.name} ({message.customer.email})</p>
          <p><strong>Message:</strong> {message.body}</p>
          <p><strong>Timestamp:</strong> {message.timestamp.toMillis() ? new Date(message.timestamp.toMillis()).toLocaleString() : 'Timestamp not available'}</p>
        </li>
      ))}
    </ul>
  );
};

export default MessageList;
