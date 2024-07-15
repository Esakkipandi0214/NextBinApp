import React, { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BellIcon } from 'lucide-react';
import Sidebar from '../Sites/sidebar';
import Dashboard from '../dashboard/dash'; // Import your components
import Orders from './orders';
import AddCustomer from './addcustomer';
import CustomerDetail from './customerDetails';
import Notification from '../Sites/notification';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc, addDoc, setDoc, DocumentReference, where } from 'firebase/firestore';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const router = useRouter();
  const [currentComponent, setCurrentComponent] = useState<string>('dashboard'); // Default component

  // Function to fetch and update notification count
  const fetchNotificationCount = () => {
    const storedNotificationCount = localStorage.getItem('notificationCount');
    if (storedNotificationCount) {
      setNotificationCount(parseInt(storedNotificationCount, 10));
    } else {
      setNotificationCount(0);
    }
  };

  // Effect to retrieve notification count from local storage on mount
  useEffect(() => {
    fetchNotificationCount();
  }, []);

  // Effect to update notification count whenever route changes
  useEffect(() => {
    const handleRouteChange = () => {
      fetchNotificationCount();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Function to handle component selection from sidebar or notification icon
  const handleSelectComponent = (componentId: string) => {
    setCurrentComponent(componentId);
  };

  // Render component based on currentComponent state
  const renderComponent = () => {
    switch (currentComponent) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <Orders />;
      case 'addCustomer':
        return <AddCustomer customer={undefined} onClose={() => setCurrentComponent('dashboard')} />;
      case 'customerDetail':
        return <CustomerDetail />;
      case 'notification':
        return <Notification />;
      default:
        return null;
    }
  };
/// Function to add or update orders in customerPriority collection
const addOrdersToCustomerPriority = async () => {
  try {
    const db = getFirestore();

    // Check if customerPriority collection exists, create it if not
    const customerPriorityRef = collection(db, 'customerPriority');
    const customerPrioritySnapshot = await getDocs(customerPriorityRef);

    if (customerPrioritySnapshot.empty) {
      await setDoc(doc(db, 'customerPriority', 'init'), { initialized: true });
      console.log('customerPriority collection created.');
    }

    // Get all orders
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('orderDate', 'desc') // Optionally order by date or any other criteria
    );
    const ordersSnapshot = await getDocs(ordersQuery);

    // Today's date without time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Flag to track if data has been stored
    let dataStored = false;

    // Process each order
    orderLoop: for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      const customerId = orderData.customerId;
      const orderDate = new Date(orderData.orderDate.replace(/-/g, '/'));

      // Check if customer already exists in customerPriority collection
      const existingCustomerPriorityQuery = query(customerPriorityRef, where('customerId', '==', customerId));
      const existingCustomerPrioritySnap = await getDocs(existingCustomerPriorityQuery);

      // If customer already exists, skip adding
      if (!existingCustomerPrioritySnap.empty) {
        console.log(`Customer ${customerId} already exists in customerPriority collection. Skipping update.`);
        continue; // Skip processing this order
      }

      // Get customer document to retrieve necessary fields
      const customerDocRef = doc(db, 'customers', customerId);
      const customerDocSnap = await getDoc(customerDocRef);

      if (customerDocSnap.exists()) {
        const customerData = customerDocSnap.data();
        const numericPart = customerData.frequency.replace(/\D/g, ''); // Remove non-digits
        const frequency = parseInt(numericPart, 10); // Convert to integer;

        // Calculate difference in days between orderDate and today
        const timeDiff = Math.abs(today.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Check if frequency exceeds days difference
        if (frequency < diffDays) {
          // Check if customer already exists in customerPriority collection (double-check)
          const recheckExistingQuery = query(customerPriorityRef, where('customerId', '==', customerId));
          const recheckExistingSnap = await getDocs(recheckExistingQuery);

          if (recheckExistingSnap.empty) {
            // Add customer priority data to Firestore
            await addDoc(customerPriorityRef, {
              customerId: customerId,
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
              frequency: frequency,
              lastOrderDate: orderDate,
              today: today,
              exceededCount: diffDays // Assuming exceededCount starts at 0
            });

            console.log(`Customer ${customerId} added to customerPriority collection.`);
            dataStored = true; // Set flag to true since data is stored
            break orderLoop; // Terminate the loop
          } else {
            console.log(`Customer ${customerId} already exists in customerPriority collection. Skipping update.`);
          }
        }
      }
    }

    // Additional logic after the loop if needed
    if (!dataStored) {
      console.log('No new data added to customerPriority collection.');
    }

  } catch (error) {
    console.error("Error adding or updating orders in customerPriority:", error);
  }
};

  // useEffect to call addOrdersToCustomerPriority on mount
  useEffect(() => {
    addOrdersToCustomerPriority();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-green-50">
      {/* Sidebar */}
      <Sidebar onSelectComponent={handleSelectComponent} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className='h-[4rem] w-full bg-[#2C4E80] flex items-center justify-between px-4'>
          {/* Navigation Links */}
          <div className='flex items-center'>
            <Link href={"/"}>
              <h1 className='pt-5 pl-2 hover:underline text-white'>Home</h1>
            </Link>
            <h1 className='pt-5 text-white'>{router.pathname}</h1>
          </div>

          {/* Notification and Profile Section */}
          <div className='flex items-center'>
            {/* Notification Icon with Count */}
            <div className='flex items-center relative mr-4' onClick={() => setCurrentComponent('notification')}>
              <BellIcon className="h-6 w-6 text-white cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {notificationCount > 0 ? notificationCount : "0"}
              </span>
            </div>
            {/* Profile Image */}
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg" // Random image for demonstration
              alt="Profile"
              className="h-8 w-8 rounded-full ml-2" // Added margin-left for spacing
            />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
};

export default Layout;
