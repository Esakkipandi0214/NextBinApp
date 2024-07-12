import React, { ReactNode } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  return (
    <div className="flex h-screen overflow-hidden bg-green-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ">
        <div className='h-[4rem] w-full bg-gray-50'>
          <div className='flex'>
<Link href= {"/"}><h1 className='pt-5 pl-7  hover:underline'>Home</h1></Link>
<h1 className='pt-5  '>{router.pathname}</h1></div>
        </div>
        <main className="h-full overflow-y-scroll">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;