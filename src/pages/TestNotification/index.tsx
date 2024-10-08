import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

interface CustomerPriorityProps {
  customerId: string;
  name: string;
  lastOrderDate: string;
  email: string;
  contactNumber: string;
  priorityClass: string;
  daysSinceLastOrder?: number; // Provided in data
  frequencyDays?: number; // Optional, if used
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerPriorityProps[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchCustomers = async () => {
    try {
      const customerPriorityCollection = collection(db, 'customerPriority');
      const querySnapshot = await getDocs(customerPriorityCollection);

      const customerData = querySnapshot.docs.map((doc) => {
        const data = doc.data() as CustomerPriorityProps;
        data.customerId = doc.id; // Use customerId for unique key
        return data;
      });

      const filteredCustomers = customerData.filter((customer) => {
        return customer.daysSinceLastOrder && customer.daysSinceLastOrder >= 5;
      });

      const newNotificationCount = filteredCustomers.length;

      setNotificationCount(newNotificationCount);

      if (newNotificationCount > 0) {
        localStorage.setItem('notificationCount', String(newNotificationCount));
      } else {
        localStorage.removeItem('notificationCount');
      }

      setCustomers(filteredCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers(); // Fetch customers on component mount
    const intervalId = setInterval(() => {
      fetchCustomers();
    }, 10000); // Fetch customers every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleSendMessage = async (customer: CustomerPriorityProps) => {
    // Assume that the contactNumber number is in the local format and needs to be converted to international format
    const contactNumber = `+91${String(customer.contactNumber).replace(/[^\d]/g, '')}`; // Format the phone number with country code
    const body = `Hello ${customer.name}, this is a reminder from our store.`;
  
    try {
      const response = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: contactNumber, body }),
      });
  
      if (response.ok) {
        alert('Message sent successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to send message: ${errorData.error} ${contactNumber}`);
      }
    } catch (error: any) {
      alert(`Failed to send message: ${error instanceof Error ? error.message : String(error)} ${contactNumber}`);
    }
  };
  

  const handleCallCustomer = async (customer: CustomerPriorityProps) => {
    const contactNumber = String(customer.contactNumber).replace(/[^\d]/g, ''); // Format the contactNumber number

    try {
      const response = await fetch('/api/makeCall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: contactNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Log success message or handle as needed
      } else {
        const errorData = await response.json();
        console.error(`Failed to initiate call: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error(`Failed to initiate call: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSendWhatsAppMessage = async (customer: CustomerPriorityProps) => {
    const contactNumber = String(customer.contactNumber).replace(/[^\d]/g, ''); // Format the phone number

    try {
      const response = await fetch('/api/sendMessageTwilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: contactNumber, message: `Hello ${customer.name}, this is a WhatsApp message from our store.` }),
      });

      if (response.ok) {
        alert('WhatsApp message sent successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to send WhatsApp message: ${errorData.error}`);
      }
    } catch (error: any) {
      alert(`Failed to send WhatsApp message: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Layout>
        <Card className="w-full h-full py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6 text-red-500 bg-yellow-500/15 border rounded-lg p-5">Freqeuncy Customers Notification</h1>
        <div className="grid gap-6">
          {customers.length > 0 ? customers.map((customer) => (
            <CustomerCard
              key={customer.customerId}
              customer={customer}
              handleSendMessage={handleSendMessage}
              handleCallCustomer={handleCallCustomer}
              handleSendWhatsAppMessage={handleSendWhatsAppMessage}
            />
          )):
          <div className=' bg-green-500/15 w-full grid justify-start pl-3 border rounded-lg items-center h-20'>
            <h1 className=' text-lg font-medium text-green-500'>Customers above frequency Not Present</h1>
          </div>
          }
        </div>
      </div>
      </Card>
    </Layout>
  );
};

interface CustomerCardProps {
  customer: CustomerPriorityProps;
  handleSendMessage: (customer: CustomerPriorityProps) => void;
  handleCallCustomer: (customer: CustomerPriorityProps) => void;
  handleSendWhatsAppMessage: (customer: CustomerPriorityProps) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, handleSendMessage, handleCallCustomer, handleSendWhatsAppMessage }) => {
  const { name, email, lastOrderDate, contactNumber, priorityClass, daysSinceLastOrder, frequencyDays } = customer;

  console.log("Sending WhatsApp message to", name, "at contactNumber ", contactNumber);
  console.log("Receiver:", contactNumber);
  console.log(
    `Customer Details: \n` +
    `Name: ${name} \n` +
    `Email: ${email} \n` +
    `Last Order Date: ${lastOrderDate} \n` +
    `contactNumber: ${contactNumber} \n` +
    `Priority Class: ${priorityClass} \n` +
    `Days Since Last Order: ${daysSinceLastOrder} \n` +
    `Frequency Days: ${frequencyDays}`
  );

  let highlightClass = priorityClass || 'bg-white';

  const handleSendMessageClick = () => {
    handleSendMessage(customer);
  };

  const handleCallCustomerClick = () => {
    handleCallCustomer(customer);
  };

  const handleWhatsAppClick = () => {
    handleSendWhatsAppMessage(customer);
  };

  return (
    <div className={`bg-background rounded-lg shadow p-6 ${highlightClass}`}>
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <div className="font-semibold">
                {name} ({daysSinceLastOrder} days ago)
              </div>
              <div className="text-sm text-muted-foreground">{email}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleCallCustomerClick}>
                <FaPhone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSendMessageClick}>
                <FaEnvelope className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleWhatsAppClick}>
                <FaWhatsapp className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-4">
            {/* Additional customer information display */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
