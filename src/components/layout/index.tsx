import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BellIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebase'; // Make sure db is imported from your Firebase config
import { collection, getDocs } from 'firebase/firestore';
import { destroyCookie } from 'nookies';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const router = useRouter();

  // Function to fetch and update notification count
  const fetchNotificationCount = async () => {
    try {
      const customerPriorityCollection = collection(db, 'customerPriority');
      const querySnapshot = await getDocs(customerPriorityCollection);
      const count = querySnapshot.size;
      setNotificationCount(count);
      localStorage.setItem('notificationCount', count.toString());
    } catch (error) {
      console.error("Error fetching notification count: ", error);
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

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      destroyCookie(null, 'token');
      router.push("/");
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-green-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <div className='h-[4rem] w-full bg-white flex items-center justify-between px-4'>
          {/* Navigation Links */}
          <div className='flex items-center'>
            <Link href={"/"}>
              <h1 className='pt-5 pl-2 hover:underline  text-gray-900 '>Home</h1>
            </Link>
            <h1 className='pt-5 text-gray-900 '>{router.pathname}</h1>
          </div>

          {/* Notification and Profile Section */}
          <div className='flex items-center'>
            {/* Notification Icon with Count */}
            <div className='flex items-center relative mr-4'>
              <Link href={"/TestNotification"}>
                <BellIcon className="h-6 w-6 text-black cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {notificationCount > 0 ? notificationCount : "0"}
                </span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
        <main className="h-full overflow-y-scroll pb-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
