import React, { useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { XIcon, LayoutDashboardIcon, ShoppingCartIcon, UserIcon, SettingsIcon, MenuIcon } from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { href: '/Dashboard', icon: <LayoutDashboardIcon className="h-5 w-5" />, label: 'Dashboard' },
    { href: '/order', icon: <ShoppingCartIcon className="h-5 w-5" />, label: 'Orders' },
    { href: '/AddCustomer', icon: <UserIcon className="h-5 w-5" />, label: 'AddCustomers' },
    { href: '/CustomerDetail', icon: <SettingsIcon className="h-5 w-5" />, label: 'CustomerDetail' },
  ];

  return (
    <div className={`h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-44'}`}>
      <div className="flex flex-col items-center h-full">
        <div className="flex h-16 items-center justify-between w-full px-4 bg-gray-200 border-b">
          <Link href="/" passHref>
            <p className="flex items-center gap-2 font-semibold text-primary cursor-pointer">
              {/* <Image src="/images.png" alt="Logo" width={20} height={20} /> */}
              <span className={`${isCollapsed ? 'hidden' : 'block'}`}>BinApp</span>
            </p>
          </Link>
          <Button size="icon" variant="outline" className="sm:hidden" onClick={() => setIsCollapsed(!isCollapsed)}>
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Open Sidebar</span>
          </Button>
        </div>
        <nav className="flex-1 overflow-auto w-full px-4 py-6 bg-white">
          <div className="grid gap-4 text-sm font-medium">
            {menuItems.map(item => (
              <Link key={item.href} href={item.href} passHref>
                <p className={`flex items-center gap-2 rounded-md px-3 py-2 text-primary transition-colors hover:bg-gray-300 cursor-pointer`}>
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </p>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          {/* <Button size="icon" variant="outline" className="fixed bottom-4 right-4 sm:hidden">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Open Sidebar</span>
          </Button> */}
        </SheetTrigger>
        <SheetContent side="left" className="sm:hidden">
          <div className="flex h-16 items-center justify-between px-4 bg-gray-200 border-b">
            <Link href="/" passHref>
              <p className="flex items-center gap-2 font-semibold text-primary cursor-pointer">
                <span>BinApp</span>
              </p>
            </Link>
            <Button size="icon" variant="outline" onClick={() => setIsCollapsed(true)}>
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Close Sidebar</span>
            </Button>
          </div>
          <nav className="grid gap-4 px-4 py-6 text-sm font-medium">
            {menuItems.map(item => (
              <Link key={item.href} href={item.href} passHref>
                <p className={`flex items-center gap-2 rounded-md px-3 py-2 text-primary transition-colors hover:bg-gray-300 cursor-pointer`}>
                  {item.icon}
                  <span>{item.label}</span>
                </p>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Sidebar;
