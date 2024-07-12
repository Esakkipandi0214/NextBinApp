import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { CartesianGrid, XAxis, Bar, BarChart } from "recharts";
import RecentOrders from "./RecentOrders";
import Chunks from './chunksSection';
import Statistics from './statistics';

interface DailyProductData {
  date: string;
  customer: string;
  materialName: string;
  materialWeight: number;
  price: number;
}

interface HighPriorityProduct {
  id: number;
  name: string;
  stock: number;
  priority: string;
}

const Dashboard: React.FC = () => {
  const [monthlyProductData, setMonthlyProductData] = useState([
    { month: "Jan", in: 1200, out: 800 },
    { month: "Feb", in: 1500, out: 900 },
    { month: "Mar", in: 1800, out: 1100 },
    { month: "Apr", in: 1600, out: 1000 },
    { month: "May", in: 1900, out: 1200 },
    { month: "Jun", in: 2000, out: 1300 },
  ]);

  useEffect(() => {
    // Simulate real-time updates with setInterval
    const interval = setInterval(() => {
      // Generate new random data (for demonstration purposes)
      const newMonthlyData = monthlyProductData.map(data => ({
        ...data,
        in: data.in + Math.floor(Math.random() * 100),
        out: data.out + Math.floor(Math.random() * 100),
      }));
      setMonthlyProductData(newMonthlyData);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [monthlyProductData]); // useEffect dependency

  const dailyProductData: DailyProductData[] = [
    { date: "2023-06-01", customer: "Customer A", materialName: "Material X", materialWeight: 500, price: 20.5 },
    { date: "2023-06-02", customer: "Customer B", materialName: "Material Y", materialWeight: 600, price: 18.2 },
    { date: "2023-06-03", customer: "Customer C", materialName: "Material Z", materialWeight: 450, price: 15.7 },
    { date: "2023-06-04", customer: "Customer A", materialName: "Material X", materialWeight: 550, price: 22.0 },
    { date: "2023-06-05", customer: "Customer B", materialName: "Material Y", materialWeight: 700, price: 24.3 },
    { date: "2023-06-06", customer: "Customer C", materialName: "Material Z", materialWeight: 400, price: 19.8 },
    { date: "2023-06-07", customer: "Customer A", materialName: "Material X", materialWeight: 650, price: 21.5 },
  ];

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
          <Chunks totalChunks={0} availableChunks={0} reservedChunks={0} />
        </div>
      </div>

      {/* Statistics Section */}
      <div className="col-span-full">
        <div className="shadow-md rounded-lg p-6" style={{ backgroundColor: "#2C4E80" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "white" }}>Statistics</h2>
          <Statistics />
        </div>
      </div>

      {/* High Priority Products Card */}
      <Card className="col-span-1 lg:col-span-2" style={{ backgroundColor: "#2C4E80" }}>
        <CardHeader>
          <CardTitle style={{ color: "white" }}>High Priority Products</CardTitle>
          <CardDescription style={{ color: "white" }}>A section highlighting high priority products.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-4">
            {highPriorityProducts.map((product) => (
              <li key={product.id} className={`flex flex-col md:flex-row items-center justify-between px-4 py-2 rounded-md ${
                product.priority === "high"
                  ? "bg-red-500 text-red-50"
                  : product.priority === "medium"
                  ? "bg-yellow-500 text-yellow-50"
                  : "bg-green-500 text-green-50"
              }`}>
                <div className="font-medium">{product.name}</div>
                {product.stock && (
                  <div className="font-bold">{product.stock}</div>
                )}
                {product.priority && (
                  <div className="font-bold">{product.priority}</div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent Orders Section */}
      <div className="col-span-full">
        <div className="shadow-md rounded-lg p-6" style={{ backgroundColor: "#2C4E80" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "white" }}>Recent Orders</h2>
          <RecentOrders />
        </div>
      </div>

      {/* Daily Product In/Out Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3" style={{ backgroundColor: "#2C4E80" }}>
        <CardHeader>
          <CardTitle style={{ color: "white" }}>Daily Product In/Out</CardTitle>
          <CardDescription style={{ color: "white" }}>A table showing the daily inflow and outflow of products.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ color: "white" }}>Date</TableHead>
                <TableHead style={{ color: "white" }}>Customer</TableHead>
                <TableHead style={{ color: "white" }}>Material Name</TableHead>
                <TableHead style={{ color: "white" }}>Material Weight</TableHead>
                <TableHead style={{ color: "white" }}>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyProductData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell style={{ color: "white" }}>{data.date}</TableCell>
                  <TableCell style={{ color: "white" }}>{data.customer}</TableCell>
                  <TableCell style={{ color: "white" }}>{data.materialName}</TableCell>
                  <TableCell style={{ color: "white" }}>{data.materialWeight}</TableCell>
                  <TableCell style={{ color: "white" }}>{data.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly Total Product In/Out Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2" style={{ backgroundColor: "#2C4E80" }}>
        <CardHeader>
          <CardTitle style={{ color: "white" }}>Monthly Total Product In/Out</CardTitle>
          <CardDescription style={{ color: "white" }}>A chart displaying the monthly total product inflow and outflow.</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart className="aspect-[4/3]" data={monthlyProductData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              style={{ color: "white" }}
            />
            <Bar dataKey="in" fill="#344C64" />
            <Bar dataKey="out" fill="#57A6A1" />
          </BarChart>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
