import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Statistics from './statistics';
import Chunks from './chunksSection';
import RecentOrders from './RecentOrders';
import CustomerSignedup from './CustomerSignedup'
import DailyProductInOut from './DailyProductInOut';
import MonthlyTotalProductChart from './MonthlyTotalProductChart';
import PriorityProducts from './priority'
interface HighPriorityProduct {
  id: number;
  name: string;
  stock: number;
  priority: string;
}

const Dashboard: React.FC = () => {
  // Static data for high priority products
  const highPriorityProducts: HighPriorityProduct[] = [
    { id: 1, name: "Product A", stock: 25, priority: "high" },
    { id: 2, name: "Product B", stock: 15, priority: "high" },
    { id: 3, name: "Product C", stock: 8, priority: "high" },
    { id: 4, name: "Product D", stock: 30, priority: "medium" },
    { id: 5, name: "Product E", stock: 45, priority: "low" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3" style={{ backgroundColor: "#00215E" }}>
      {/* Chunks Section */}
      <div className="col-span-full">
        <div className="shadow-md rounded-lg p-6" style={{ backgroundColor: "#2C4E80" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "white" }}>Chunks</h2>
          <Chunks newCustomersToday={0} newCustomersThisWeek={0} newCustomersThisMonth={0}/>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="col-span-full">
        <div className="shadow-md rounded-lg p-6" style={{ backgroundColor: "#2C4E80" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "white" }}>Statistics</h2>
          <Statistics />
        </div>
      </div>

      {/* High Priority Products Section */}
      <PriorityProducts/>

      {/* Recent Orders Section */}
      <div className="col-span-full">
        <div className="shadow-md rounded-lg p-6" style={{ backgroundColor: "#2C4E80" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "white" }}>Recent Orders</h2>
          <RecentOrders />
        </div>
      </div>
       {/* New Customer Signed up */}
      <div className="col-span-full">
        <div className="shadow-md rounded-lg p-6" style={{ backgroundColor: "#2C4E80" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "white" }}>CustomerSignedup</h2>
          <CustomerSignedup/>
        </div>
      </div>

      {/* Daily Product In/Out Section */}
      <DailyProductInOut />

      {/* Monthly Total Product In/Out Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2" style={{ backgroundColor: "#2C4E80" }}>
        <CardHeader>
          <CardTitle style={{ color: "white" }}>Monthly Total Product In/Out</CardTitle>
          <CardDescription style={{ color: "white" }}>A chart displaying the monthly total product inflow and outflow.</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyTotalProductChart />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
