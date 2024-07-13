import React from 'react';
import Link from 'next/link';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { XIcon, LayoutDashboardIcon, ShoppingCartIcon, UserIcon, SettingsIcon, MenuIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface SidebarProps {
  onSelectComponent: (componentId: string) => void; // Define onSelectComponent prop
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectComponent }) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', href: '/Dashboard', icon: <LayoutDashboardIcon className="h-5 w-5" />, label: 'Dashboard' },
    { id: 'orders', href: '/order', icon: <ShoppingCartIcon className="h-5 w-5" />, label: 'Orders' },
    { id: 'addCustomer', href: '/AddCustomer', icon: <UserIcon className="h-5 w-5" />, label: 'Add Customers' },
    { id: 'customerDetail', href: '/CustomerDetail', icon: <SettingsIcon className="h-5 w-5" />, label: 'Customer Detail' },
  ];

  return (
    <div className={`h-screen bg-[#2C4E80] text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex flex-col items-center h-full">
        <div className="flex h-16 items-center justify-center w-full px-4 border-b border-gray-700">
          <Link href="/" passHref>
            <p className="flex items-center justify-center gap-2 font-semibold text-white cursor-pointer">
              <span className={`text-3xl ml-4 ${isCollapsed ? 'hidden' : 'block'}`}>BinApp</span>
            </p>
          </Link>
          <Button size="icon" variant="outline" className="sm:hidden" onClick={() => setIsCollapsed(!isCollapsed)}>
            <MenuIcon className="h-5 w-5 text-black" />
            <span className="sr-only">Open Sidebar</span>
          </Button>
        </div>
        <nav className="flex-1 overflow-auto w-full px-4 py-6">
          <div className="grid gap-4 text-sm font-medium">
            {menuItems.map(item => (
              <p
                key={item.id}
                onClick={() => onSelectComponent(item.id)} // Call onSelectComponent with item.id
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-white transition-colors hover:bg-[#00215E] cursor-pointer ${
                  router.pathname === item.href ? 'bg-[#00215E]' : ''
                }`}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
              </p>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
