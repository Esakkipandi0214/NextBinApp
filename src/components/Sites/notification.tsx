import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

interface CustomerProps {
  name: string;
  joinDate: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastLogin: string;
  lastOrderDate: string;
  lifetimeOrders: number;
  orders: OrderProps[];
}

interface OrderProps {
  customerId: string;
  orderDate: string;
  orderPayment: number;
  status: string;
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const fetchCustomers = async () => {
    try {
      const customersCollection = collection(db, 'customers');
      const querySnapshot = await getDocs(customersCollection);

      const customerDataPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data() as CustomerProps;
        const customerId = doc.id;
        data.orders = [];

        const ordersCollection = collection(db, 'orders');
        const ordersQuery = query(ordersCollection, where('customerId', '==', customerId));
        const ordersSnapshot = await getDocs(ordersQuery);

        const ordersData = ordersSnapshot.docs.map((orderDoc) => {
          const orderData = orderDoc.data() as OrderProps;
          return orderData;
        });

        data.orders = ordersData;

        if (ordersData.length > 0) {
          const lastOrder = ordersData.reduce((latest, order) => {
            const orderDate = new Date(order.orderDate);
            return orderDate > new Date(latest.orderDate) ? order : latest;
          });
          data.lastOrderDate = lastOrder.orderDate;
        } else {
          data.lastOrderDate = '';
        }

        return data;
      });

      const customerData = await Promise.all(customerDataPromises);

      const filteredCustomers = customerData.filter((customer) => {
        const daysSinceLastOrdered = calculateDaysSinceLastOrder(customer.lastOrderDate);
        return daysSinceLastOrdered >= 5;
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
    const intervalId = setInterval(() => {
      fetchCustomers();
    }, 10000); // Fetch customers every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleSendMessage = async (customer: CustomerProps) => {
    console.log("Sending message to", customer.name, "at phone number", customer.phone);
    const body = `Hello ${customer.name}, this is a reminder from our store.`;
    try {
      const response = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: customer.phone, body }),
      });

      if (response.ok) {
        alert('Message sent successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to send message: ${errorData.error}`);
      }
    } catch (error: any) {
      alert(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleCallCustomer = async (customer: CustomerProps) => {
    const phoneNumber = customer.phone;
  
    try {
      const response = await fetch('/api/makeCall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber }),
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
  

  const handleSendWhatsAppMessage = async (customer: CustomerProps) => {
    console.log("Sending WhatsApp message to", customer.name, "at phone number", customer.phone);
    try {
      const response = await fetch('/api/sendMessageTwilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: customer.phone, message: `Hello ${customer.name}, this is a WhatsApp message from our store.` }),
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Customer List</h1>
      <div className="grid gap-6">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.email}
            customer={customer}
            handleSendMessage={handleSendMessage}
            handleCallCustomer={handleCallCustomer}
            handleSendWhatsAppMessage={handleSendWhatsAppMessage}
          />
        ))}
      </div>
    </div>
  );
};

interface CustomerCardProps {
  customer: CustomerProps;
  handleSendMessage: (customer: CustomerProps) => void;
  handleCallCustomer: (customer: CustomerProps) => void;
  handleSendWhatsAppMessage: (customer: CustomerProps) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, handleSendMessage, handleCallCustomer, handleSendWhatsAppMessage }) => {
  const { name, email, lastOrderDate, phone } = customer;
  const daysSinceLastOrdered = calculateDaysSinceLastOrder(lastOrderDate);
  let highlightClass = '';

  if (!isNaN(daysSinceLastOrdered)) {
    if (daysSinceLastOrdered >= 10) {
      highlightClass = 'bg-red-100';
    } else if (daysSinceLastOrdered >= 5) {
      highlightClass = 'bg-yellow-100';
    }
  }

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
                {name} ({daysSinceLastOrdered} days ago)
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

function calculateDaysSinceLastOrder(lastOrderDate: string): number {
  if (!lastOrderDate) {
    console.log("Last order date not passed");
    return NaN;
  }
  const lastOrder = new Date(lastOrderDate);
  if (isNaN(lastOrder.getTime())) {
    console.log("Invalid last order date");
    return NaN;
  }
  const currentDate = new Date();
  const differenceInTime = currentDate.getTime() - lastOrder.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  return differenceInDays;
}

export default CustomerList;
