import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout';
import { db } from '../../firebase'; // Ensure this import is correct
import { collection, getDocs, query, where, setDoc, doc, deleteDoc, getFirestore } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

interface CustomerProps {
  email: string;
  id: string;
  firstName: string;
  lastName: string;
  joinDate: string;
  contactNumber: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastLogin: string;
  lastOrderDate: string;
  lifetimeOrders: number;
  frequency: string; // Assuming frequency is a string like "20Days"
  orders: OrderProps[];
  identityProof: string;
  postCode: string;
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
      try {
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

          // Pass only the 0 index order
          if (ordersData.length > 0) {
            data.lastOrderDate = ordersData[0].orderDate;
          } else {
            data.lastOrderDate = '';
          }

          return data;
        });

        const customerData = await Promise.all(customerDataPromises);
        setCustomers(customerData);
        setFilteredCustomers(customerData);

        // Call function to store customers in customerPriority collection
        storeCustomerInPriority(customerData);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const router = useRouter();

  const handleCustomerSelect = (customerId: string) => {
    router.push(`/CustomerDetail/${customerId}`);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        `${customer.firstName.toLowerCase()} ${customer.lastName.toLowerCase()}`.includes(query)
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

  const extractFrequency = (frequency: string | number): number => {
    const frequencyStr = String(frequency); // Convert to string
    const match = frequencyStr.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  };
  

  const storeCustomerInPriority = async (customers: CustomerProps[]) => {
    try {
      const db = getFirestore();
      const customerPriorityRef = collection(db, 'customerPriority');

      // Fetch all documents from the customerPriority collection
      const priorityQuerySnapshot = await getDocs(customerPriorityRef);
      const existingPriorityCustomers = priorityQuerySnapshot.docs.map(doc => doc.id);

      const updatedPriorityCustomers = new Set<string>();

      for (const customer of customers) {
        const daysSinceLastOrder = calculateDaysSinceLastOrder(customer.lastOrderDate);
        let highlightClass = '';

        if (!isNaN(daysSinceLastOrder) && customer.frequency) {
          const frequencyDays = extractFrequency(customer.frequency);
          const daysDifference = daysSinceLastOrder - frequencyDays;
          const PriorityOne = frequencyDays + 15;
          const PriorityTwo = frequencyDays + 10;
          const PriorityThree = frequencyDays + 5;

          if (daysSinceLastOrder >= PriorityOne) {
            highlightClass = 'bg-red-100';
          } else if (daysSinceLastOrder >= PriorityTwo) {
            highlightClass = 'bg-yellow-100';
          } else if (daysSinceLastOrder >= PriorityThree) {
            highlightClass = 'bg-green-100';
          }

          // Check if customer should be added to or updated in the customerPriority collection
          if (daysSinceLastOrder >= frequencyDays) {
            // Add or update customer in priority collection
            const customerDocRef = doc(db, 'customerPriority', customer.id);
            await setDoc(customerDocRef, {
              customerId: customer.id,
              firstName: customer.firstName,
              lastName: customer.lastName,
              contactNumber: customer.contactNumber,
              lastOrderDate: customer.lastOrderDate,
              daysSinceLastOrder: daysSinceLastOrder,
              frequencyDays: frequencyDays,
              priorityClass: highlightClass
            }, { merge: true }); // Use merge to update if exists
            updatedPriorityCustomers.add(customer.id);
          }
        }
      }

      // Remove customers from the priority collection if they don't meet the criteria anymore
      for (const docId of existingPriorityCustomers) {
        if (!updatedPriorityCustomers.has(docId)) {
          const customerDocRef = doc(db, 'customerPriority', docId);
          await deleteDoc(customerDocRef);
        }
      }

    } catch (error) {
      console.error("Error storing customers in customerPriority:", error);
    }
  };

  return (
    <Layout>
        <Card className="w-full  py-6">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Customer List</h1>
        <Input
          type="text"
          className="border border-gray-300 rounded w-full md:w-1/2 py-2 mb-4 px-4"
          placeholder="Search customers by name"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => {
            const daysSinceLastOrder = calculateDaysSinceLastOrder(customer.lastOrderDate);
            let highlightClass = '';
            if (!isNaN(daysSinceLastOrder) && customer.frequency) {
              const frequencyDays = extractFrequency(customer.frequency);
              const daysDifference = daysSinceLastOrder - frequencyDays;
              const PriorityOne = frequencyDays + 15;
              const PriorityTwo = frequencyDays + 10;
              const PriorityThree = frequencyDays + 5;

              if (daysSinceLastOrder >= PriorityOne) {
                highlightClass = 'bg-red-100';
              } else if (daysSinceLastOrder >= PriorityTwo) {
                highlightClass = 'bg-yellow-100';
              } else if (daysSinceLastOrder >= PriorityThree) {
                highlightClass = 'bg-green-100';
              }
            }

            return (
              <div
                key={customer.id}
                className={`cursor-pointer border border-gray-200 p-6 rounded-lg shadow-md ${highlightClass} hover:shadow-lg transition-shadow duration-300`}
                onClick={() => handleCustomerSelect(customer.id)}
              >
                <h3 className="text-lg font-medium mb-2">{`${customer.firstName} ${customer.lastName}`}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>contactNumber:</strong> {customer.contactNumber}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </Card>
    </Layout>
  );
};

export default CustomerList;
