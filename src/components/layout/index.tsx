import React, { ReactNode } from 'react';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="h-full overflow-y-scroll">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
