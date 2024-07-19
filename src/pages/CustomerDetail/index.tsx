import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout';
import { db } from '../../firebase'; // Assuming you've exported db from your Firebase initialization file
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Input } from '@/components/ui/input';

interface CustomerProps {
  id: string;
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
  orderType: string;
  orderDate: string;
  orderTime: number;
  orderWeight: string;
  customerId: string;
  orderPayment: number;
  status: string;
  id: string;
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerProps[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const customersCollection = collection(db, 'customers');
      const querySnapshot = await getDocs(customersCollection);

      const customerDataPromises = querySnapshot.docs.map(async doc => {
        const data = doc.data() as CustomerProps;
        const customerId = doc.id;
        data.id = customerId;
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
      setCustomers(customerData);
      setFilteredCustomers(customerData);
    };

    fetchCustomers();
  }, []);

  const router = useRouter();

  const handleCustomerSelect = (customerId: string) => {
    router.push(`/CustomerDetail/${customerId}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    }
  };

  const calculateDaysSinceLastOrder = (lastOrderDate: string): number => {
    if (!lastOrderDate) {
      return NaN;
    }
    const lastOrder = new Date(lastOrderDate);
    if (isNaN(lastOrder.getTime())) {
      return NaN;
    }
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - lastOrder.getTime();
    return Math.floor(differenceInTime / (1000 * 3600 * 24));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Customer List</h1>
        <Input
          type="text"
          className="border border-gray-300 rounded w-1/2 py-2 mb-4"
          placeholder="Search customers by name"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div className="grid gap-4">
          {filteredCustomers.map(customer => {
            const daysSinceLastOrder = calculateDaysSinceLastOrder(customer.lastOrderDate);
            let highlightClass = '';

            if (!isNaN(daysSinceLastOrder)) {
              if (daysSinceLastOrder >= 10) {
                highlightClass = 'bg-red-100';
              } else if (daysSinceLastOrder >= 5) {
                highlightClass = 'bg-yellow-100';
              }
            }

            return (
              <div
                key={customer.id}
                className={`cursor-pointer border border-gray-200 p-2 rounded-md w-1/2 ${highlightClass}`}
                onClick={() => handleCustomerSelect(customer.id)}
              >
                <h3 className="text-lg font-medium">{customer.name}</h3>
                <p className="text-sm text-gray-500">
                  Last order: {!isNaN(daysSinceLastOrder) ? daysSinceLastOrder : "Not available"} days ago
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default CustomerList;
