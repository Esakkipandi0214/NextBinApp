// components/Layout.js
import React, { ReactNode } from 'react';
import Sidebar from '../Side2';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  return (
    <div className="flex">
      <Sidebar />
      
      <main className="flex-1  overflow-y-scroll ">
        {children}
      </main>
    </div>
  );
};

export default Layout;