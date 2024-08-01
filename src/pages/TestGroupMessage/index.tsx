import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import API_BASE_URL from './../../../apiConfig';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

interface CustomerProps {
  customerId: string;
  name: string;
  lastOrderDate: string;
  email: string;
  phone: string;
  orders?: OrderProps[];
}

interface OrderProps {
  totalWeight: number;
  customerId: string;
  orderDate: string;
  orderItems: {
    category: string;
    pricePerKg: string;
    subCategory: string;
    weight: string;
    
  }[];
  totalPrice: number;
  status: string;
}

const weightCategories = [
  { label: '0 to 50 kgs', value: '0-50' },
  { label: '51 to 100 kgs', value: '51-100' },
  { label: '101 to 500 kgs', value: '101-500' },
  { label: '501 and above', value: '501+' },
];

const materials = [
  'Aluminum',
  'Copper',
  'Compressor',
  'Stainless',
  'Batteries'
  // Add more materials as needed
];

const filterData = (customers: CustomerProps[], material: string, weightCategory: string, date: string): CustomerProps[] => {
  let filteredCustomers = customers;

  if (material) {
    filteredCustomers = filteredCustomers.map((customer) => {
      const filteredOrders = customer.orders?.filter((order) =>
        order.orderItems.some((item) => item.category === material)
      ) || [];
      return {
        ...customer,
        orders: filteredOrders,
      };
    }).filter(customer => customer.orders.length > 0);
  }

  if (weightCategory) {
    const isAbove = weightCategory.includes('+');
    console.log("Above 501:",isAbove);
    const [minWeight, maxWeight] = isAbove ? [501, undefined] : weightCategory.split('-').map(Number);

    filteredCustomers = filteredCustomers.map((customer) => {
      const filteredOrders = customer.orders?.filter((order) => {
        const totalWeight = order.totalWeight || order.orderItems.reduce((sum, item) => sum + parseFloat(item.weight), 0);
        return isAbove ? totalWeight >= minWeight : (maxWeight ? totalWeight >= minWeight && totalWeight <= maxWeight : totalWeight >= minWeight);
      }) || [];
      return {
        ...customer,
        orders: filteredOrders,
      };
    }).filter(customer => customer.orders.length > 0);
  }

   // Filter by single date
   if (date) {
    filteredCustomers = filteredCustomers.map((customer) => {
      const filteredOrders = customer.orders?.filter((order) => 
        order.orderDate === date
      ) || [];
      return {
        ...customer,
        orders: filteredOrders,
      };
    }).filter(customer => customer.orders.length > 0);
  }

  return filteredCustomers;
};

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [weightFilter, setWeightFilter] = useState<string>('');
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [orderDateFilter, setOrderDateFilter] = useState<string>('');
  const [messageBody, setMessageBody] = useState<string>(''); // New state variable for message body
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchCustomersAndOrders = async () => {
    try {
      const customersCollection = collection(db, 'customers');
      const customersSnapshot = await getDocs(customersCollection);
      const customerData = await Promise.all(customersSnapshot.docs.map(async (doc) => {
        const data = doc.data() as CustomerProps;
        data.customerId = doc.id;
        data.orders = [];

        const ordersCollection = collection(db, 'orders');
        const ordersQuery = query(ordersCollection, where('customerId', '==', data.customerId));
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
      }));
      console.log("Customer Details:", customerData);
      // Apply filters to the fetched data
      const filteredCustomerData = filterData(customerData, materialFilter,weightFilter,orderDateFilter);
      setCustomers(filteredCustomerData);
    } catch (error) {
      console.error('Error fetching customers and orders:', error);
      setError('Failed to fetch customers and orders. Please try again later.');
    }
  };

  useEffect(() => {
    fetchCustomersAndOrders();
    const intervalId = setInterval(fetchCustomersAndOrders, 10000);

    return () => clearInterval(intervalId);
  }, [weightFilter, materialFilter, orderDateFilter]);

  const handleSendMessage = async () => {
    try {
      const selectedCustomerList = Array.from(selectedCustomers);

      const recipients = selectedCustomerList
        .map(customerId => {
          const customer = customers.find(c => c.customerId === customerId);
          return customer ? customer.phone : undefined;
        })
        .filter((phone): phone is string => phone !== undefined);

      if (recipients.length > 0) {
        const response = await fetch(`${API_BASE_URL}/api/sendGroupaMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipients, body: messageBody })
        });

        const result = await response.json();

        if (response.ok) {
          alert(`Messages sent successfully. ${result.successful} successful, ${result.failed} failed.`);
        } else {
          setError(`Failed to send messages. ${result.message || 'Please try again later.'}`);
        }
      } else {
        setError('No recipients selected.');
      }
    } catch (error) {
      console.error('Failed to send messages:', error);
      setError('Failed to send messages. Please try again later.');
    }
  };

  const handleCallCustomer = async () => {
    try {
      const selectedCustomerList = Array.from(selectedCustomers);

      const phoneNumbers = selectedCustomerList
        .map(customerId => {
          const customer = customers.find(c => c.customerId === customerId);
          return customer ? customer.phone : undefined;
        })
        .filter((phone): phone is string => phone !== undefined);

      if (phoneNumbers.length === 0) {
        setError('No customers selected or invalid phone numbers.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/groupCall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toNumbers: phoneNumbers })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Calls initiated successfully. ${result.successful} successful, ${result.failed} failed.`);
      } else {
        setError(`Failed to initiate calls. ${result.message || 'Please try again later.'}`);
      }
    } catch (error) {
      console.error('Failed to make calls:', error);
      setError('Failed to initiate calls. Please try again later.');
    }
  };

  const handleSendWhatsAppMessage = async () => {
    try {
      const selectedCustomerList = Array.from(selectedCustomers);

      if (selectedCustomerList.length === 0) {
        setError('No customers selected.');
        return;
      }

      const recipients = selectedCustomerList
        .map(customerId => customers.find(c => c.customerId === customerId))
        .filter(customer => customer && customer.phone) as { phone: string }[];

      if (recipients.length === 0) {
        setError('No valid customers found.');
        return;
      }

      const phoneNumbers = recipients.map(customer =>
        String(customer.phone).replace(/[^\d]/g, '')
      );

      const response = await fetch(`${API_BASE_URL}/api/groupWattsappMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: phoneNumbers,
          message: messageBody
        }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        alert('WhatsApp messages sent successfully!');
      } else {
        setError('Failed to send WhatsApp messages.');
      }
    } catch (error) {
      console.error('Failed to send WhatsApp messages:', error);
      setError('Failed to send WhatsApp messages. Please try again later.');
    }
  };

  const getCustomerOrders = (customerId: string) => {
    const customer = customers.find(c => c.customerId === customerId);
    return customer ? customer.orders || [] : [];
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(customerId)) {
        newSelection.delete(customerId);
      } else {
        newSelection.add(customerId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map(customer => customer.customerId)));
    }
  };

  const applyFilters = () => {
    fetchCustomersAndOrders();
  };

  const clearFilters = () => {
    setWeightFilter('');
    setMaterialFilter('');
    setOrderDateFilter('');
    fetchCustomersAndOrders();
  };

  return (
    <Layout>
       <Card className="w-full  py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer List</h1>

        {/* Filter Controls */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
          <div className="flex gap-4 mb-4">
            <select
              value={weightFilter}
              onChange={(e) => setWeightFilter(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Weight</option>
              {weightCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Material</option>
              {materials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={orderDateFilter}
              onChange={(e) => setOrderDateFilter(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Message Body Input */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
          <textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Enter message body"
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Customer List */}
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
  <tr>
    <th className="px-6 py-3 border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-semibold">
      <input
        type="checkbox"
        checked={selectedCustomers.size === customers.length}
        onChange={handleSelectAll}
        className="form-checkbox h-4 w-4 text-blue-600"
      />
    </th>
    <th className="px-6 py-3 border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-semibold">Customer Name</th>
    <th className="px-6 py-3 border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-semibold">Last Order Date</th>
    <th className="px-6 py-3 border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-semibold">Email</th>
    <th className="px-6 py-3 border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-semibold">Phone</th>
  </tr>
</thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.customerId}>
                <td className="px-6 py-4 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.has(customer.customerId)}
                    onChange={() => toggleCustomerSelection(customer.customerId)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                </td>
                <td className="px-6 py-4 border-b border-gray-200 text-gray-800">{customer.name}</td>
                <td className="px-6 py-4 border-b border-gray-200 text-gray-800">{customer.lastOrderDate}</td>
                <td className="px-6 py-4 border-b border-gray-200 text-gray-800">{customer.email}</td>
                <td className="px-6 py-4 border-b border-gray-200 text-gray-800">{customer.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600"
          >
            Send Message
          </button>
          <button
            onClick={handleCallCustomer}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-sm hover:bg-yellow-600"
          >
            Call Customer
          </button>
          <button
            onClick={handleSendWhatsAppMessage}
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600"
          >
            Send WhatsApp Message
          </button>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      </Card>
    </Layout>
  );
};

export default CustomerList;
