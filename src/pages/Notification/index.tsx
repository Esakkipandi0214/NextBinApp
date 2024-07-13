import { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FaPhone, FaEnvelope } from 'react-icons/fa';

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

export default function CustomerList() {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersCollection = collection(db, 'customers');
        const querySnapshot = await getDocs(customersCollection);

        const customerDataPromises = querySnapshot.docs.map(async doc => {
          const data = doc.data() as CustomerProps;
          const customerId = doc.id;
          data.orders = [];

          const ordersCollection = collection(db, 'orders');
          const ordersQuery = query(ordersCollection, where('customerId', '==', customerId));
          const ordersSnapshot = await getDocs(ordersQuery);

          const ordersData = ordersSnapshot.docs.map(orderDoc => {
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

        const filteredCustomers = customerData.filter(customer => {
          const daysSinceLastOrdered = calculateDaysSinceLastOrder(customer.lastOrderDate);
          return daysSinceLastOrdered >= 5;
        });

        const newNotificationCount = filteredCustomers.length;

        setNotificationCount(newNotificationCount);

        setCustomers(filteredCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Customer List</h1>
        <div className="grid gap-6">
          {customers.map(customer => (
            <CustomerCard key={customer.email} customer={customer} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

interface CustomerCardProps {
  customer: CustomerProps;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  const { name, email, lastOrderDate } = customer;
  const daysSinceLastOrdered = calculateDaysSinceLastOrder(lastOrderDate);
  let highlightClass = '';

  if (!isNaN(daysSinceLastOrdered)) {
    if (daysSinceLastOrdered >= 10) {
      highlightClass = 'bg-red-100';
    } else if (daysSinceLastOrdered >= 5) {
      highlightClass = 'bg-yellow-100';
    }
  }

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
              <Button variant="ghost" size="icon">
                <FaPhone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <FaEnvelope className="h-5 w-5" />
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
