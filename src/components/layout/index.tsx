import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BellIcon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const router = useRouter();

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
    const intervalId = setInterval(() => {
      fetchNotificationCount();
      console.log("Notification fetched");
    }, 10000); // Interval of 1 second (1000 milliseconds)

    // Cleanup function to clear the interval if the component unmounts
    return () => clearInterval(intervalId);
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

  return (
    <div className="flex h-screen overflow-hidden bg-green-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
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
            <div className='flex items-center relative mr-4'>
              <Link href={"/Notification"}>
                <BellIcon className="h-6 w-6 text-white cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {notificationCount > 0 ? notificationCount : "0"}
                </span>
              </Link>
            </div>
            {/* Profile Image */}
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg" // Random image for demonstration
              alt="Profile"
              className="h-8 w-8 rounded-full ml-2" // Added margin-left for spacing
            />
          </div>
        </div>
        <main className="h-full overflow-y-scroll">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
