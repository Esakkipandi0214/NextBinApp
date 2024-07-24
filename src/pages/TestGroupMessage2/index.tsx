import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import API_BASE_URL from './../../../apiConfig'


interface CustomerProps {
  customerId: string;
  name: string;
  lastOrderDate: string;
  email: string;
  phone: string;
  orders?: OrderProps[];
}

interface OrderProps {
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

const filterData = (customers: CustomerProps[], material: string): CustomerProps[] => {
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

  return filteredCustomers;
};



const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [weightFilter, setWeightFilter] = useState<string>('');
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [orderDateFilter, setOrderDateFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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
      const filteredCustomerData = filterData(customerData, materialFilter);
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
  
      // Prepare the recipients and message body
      const recipients = selectedCustomerList
        .map(customerId => {
          const customer = customers.find(c => c.customerId === customerId);
          return customer ? customer.phone : undefined; // Ensure we handle undefined values
        })
        .filter((phone): phone is string => phone !== undefined); // Filter out any undefined results
  
      const messageBody = 'Hello, your last order was on ...'; // You can customize this message as needed
  
      // Ensure there are recipients to send messages to
      if (recipients.length > 0) {
        // Send a single request to the API with all recipients
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
  
      // Prepare the array of phone numbers
      const phoneNumbers = selectedCustomerList
        .map(customerId => {
          // Find customer and handle possible undefined result
          const customer = customers.find(c => c.customerId === customerId);
          return customer ? customer.phone : undefined;
        })
        .filter((phone): phone is string => phone !== undefined); // Filter out undefined phone numbers
  
      if (phoneNumbers.length === 0) {
        setError('No customers selected or invalid phone numbers.');
        return;
      }
  
      // Send a single request to the API with all phone numbers
      const response = await fetch(`${API_BASE_URL}/api/groupCall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toNumbers: phoneNumbers }) // Pass phoneNumbers array
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
  
      const messageBody = `Hello, your last order was on ${new Date().toLocaleDateString()}.`;
  
      if (recipients.length === 0) {
        setError('No valid customers found.');
        return;
      }
      const phoneNumbers = recipients.map(customer => 
        String(customer.phone).replace(/[^\d]/g, '') // Remove all non-digit characters
      );
  
    //   const phoneNumbers = recipients.map(customer => `${customer.phone}`);
  
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
console.log("Material Filter:",materialFilter);
  return (
    <Layout>
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
            <Button onClick={applyFilters} className="bg-blue-500 text-white hover:bg-blue-600">Apply Filters</Button>
            <Button onClick={clearFilters} className="bg-gray-300 text-gray-700 hover:bg-gray-400">Clear Filters</Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <Button onClick={handleSendMessage} className="bg-green-500 text-white hover:bg-green-600 mr-2">Send Message</Button>
          <Button onClick={handleCallCustomer} className="bg-yellow-500 text-white hover:bg-yellow-600 mr-2">Make Call</Button>
          <Button onClick={handleSendWhatsAppMessage} className="bg-blue-500 text-white hover:bg-blue-600">Send WhatsApp Message</Button>
          <Button onClick={handleSelectAll} className="bg-gray-500 text-white hover:bg-gray-600 mt-4">Toggle All</Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Customer List */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.size === customers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map(customer => (
                <tr key={customer.customerId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.has(customer.customerId)}
                      onChange={() => toggleCustomerSelection(customer.customerId)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.lastOrderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerList;
