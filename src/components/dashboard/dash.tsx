import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { CartesianGrid, XAxis, Bar, BarChart } from "recharts";
import RecentOrders from "./RecentOrders"; // Importing RecentOrders component

function Dashboard() {
  const dailyProductData = [
    { date: "2023-06-01", customer: "Customer A", materialName: "Material X", materialWeight: 500, price: 20.5 },
    { date: "2023-06-02", customer: "Customer B", materialName: "Material Y", materialWeight: 600, price: 18.2 },
    { date: "2023-06-03", customer: "Customer C", materialName: "Material Z", materialWeight: 450, price: 15.7 },
    { date: "2023-06-04", customer: "Customer A", materialName: "Material X", materialWeight: 550, price: 22.0 },
    { date: "2023-06-05", customer: "Customer B", materialName: "Material Y", materialWeight: 700, price: 24.3 },
    { date: "2023-06-06", customer: "Customer C", materialName: "Material Z", materialWeight: 400, price: 19.8 },
    { date: "2023-06-07", customer: "Customer A", materialName: "Material X", materialWeight: 650, price: 21.5 },
  ];
  
  const monthlyProductData = [
    { month: "Jan", in: 1200, out: 800 },
    { month: "Feb", in: 1500, out: 900 },
    { month: "Mar", in: 1800, out: 1100 },
    { month: "Apr", in: 1600, out: 1000 },
    { month: "May", in: 1900, out: 1200 },
    { month: "Jun", in: 2000, out: 1300 },
  ];
  
  const highPriorityProducts = [
    { id: 1, name: "Product A", stock: 25, priority: "high" },
    { id: 2, name: "Product B", stock: 15, priority: "high" },
    { id: 3, name: "Product C", stock: 8, priority: "high" },
    { id: 4, name: "Product D", stock: 30, priority: "medium" },
    { id: 5, name: "Product E", stock: 45, priority: "low" },
  ];
  
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Recent Orders Section */}
      <div className="col-span-full">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <RecentOrders />
        </div>
      </div>

      {/* Daily Product In/Out Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Daily Product In/Out</CardTitle>
          <CardDescription>A table or chart showing the daily inflow and outflow of products.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Material Name</TableHead>
                <TableHead>Material Weight</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyProductData.map((data) => (
                <TableRow key={data.date}>
                  <TableCell>{data.date}</TableCell>
                  <TableCell>{data.customer}</TableCell>
                  <TableCell>{data.materialName}</TableCell>
                  <TableCell>{data.materialWeight}</TableCell>
                  <TableCell>{data.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly Total Product In/Out Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Total Product In/Out</CardTitle>
          <CardDescription>A chart or graph displaying the monthly total product inflow and outflow.</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart className="aspect-[4/3]"
            data={[
              { month: "Jan", in: 1200, out: 800 },
              { month: "Feb", in: 1500, out: 900 },
              { month: "Mar", in: 1800, out: 1100 },
              { month: "Apr", in: 1600, out: 1000 },
              { month: "May", in: 1900, out: 1200 },
              { month: "Jun", in: 2000, out: 1300 },
            ]}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
          </BarChart>
        </CardContent>
      </Card>

      {/* High Priority Products Card */}
      <Card className="col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle>High Priority Products</CardTitle>
          <CardDescription>A section highlighting the high priority products, potentially with indicators or labels to make them stand out.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-4">
            {highPriorityProducts.map((product) => (
              <li key={product.id} className={`flex items-center justify-between px-4 py-2 rounded-md ${
                product.priority === "high"
                  ? "bg-red-500 text-red-50"
                  : product.priority === "medium"
                  ? "bg-yellow-500 text-yellow-50"
                  : "bg-green-500 text-green-50"
              }`}>
                <div className="font-medium">{product.name}</div>
                <div className="font-bold">{product.stock}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;

// //=======================================================================

// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// import { CartesianGrid, XAxis, Bar, BarChart } from "recharts";
// import RecentOrders from "./RecentOrders"; // Importing RecentOrders component
// import { db } from "../../firebase"; // Assuming you've exported db from your Firebase initialization file
// import { collection, getDocs } from "firebase/firestore"; 

// // Define types for your data structures
// interface DailyProductData {
//   date: string;
//   customer: string;
//   materialName: string;
//   materialWeight: number;
//   price: number;
// }

// interface MonthlyProductData {
//   month: string;
//   in: number;
//   out: number;
// }

// interface HighPriorityProduct {
//   id: number;
//   name: string;
//   stock: number;
//   priority: 'high' | 'medium' | 'low';
// }

// const Dashboard: React.FC = () => {
//   const [dailyProductData, setDailyProductData] = useState<DailyProductData[]>([]);
//   const [loading, setLoading] = useState(true); // State to manage loading state
  
//   useEffect(() => {
//     // Function to fetch daily product data from Firestore
//     const fetchDailyProductData = async () => {
//       try {
//         const dailyOrdersCollection = collection(db, 'customers');
//         const snapshot = await getDocs(dailyOrdersCollection);
//         const data = snapshot.docs.map(doc => doc.data() as DailyProductData); // Ensure mapping to DailyProductData type
//         setDailyProductData(data);
//       } catch (error) {
//         console.error('Error fetching daily product data:', error);
//       } finally {
//         setLoading(false); // Set loading state to false after data fetching completes (whether successful or not)
//       }
//     };

//     fetchDailyProductData();
//   }, [db]); // Dependency array ensures this effect runs once on component mount

//   // Example data structure for monthly product data
//   const monthlyProductData: MonthlyProductData[] = [
//     { month: "Jan", in: 1200, out: 800 },
//     { month: "Feb", in: 1500, out: 900 },
//     { month: "Mar", in: 1800, out: 1100 },
//     { month: "Apr", in: 1600, out: 1000 },
//     { month: "May", in: 1900, out: 1200 },
//     { month: "Jun", in: 2000, out: 1300 },
//   ];

//   // Example data structure for high priority products
//   const highPriorityProducts: HighPriorityProduct[] = [
//     { id: 1, name: "Product A", stock: 25, priority: "high" },
//     { id: 2, name: "Product B", stock: 15, priority: "high" },
//     { id: 3, name: "Product C", stock: 8, priority: "high" },
//     { id: 4, name: "Product D", stock: 30, priority: "medium" },
//     { id: 5, name: "Product E", stock: 45, priority: "low" },
//   ];

//   // Render loading state if data is still being fetched
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
//       {/* Recent Orders Section */}
//       <div className="col-span-full">
//         <div className="bg-white shadow-md rounded-lg p-6">
//           <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
//           <RecentOrders />
//         </div>
//       </div>

//       {/* Daily Product In/Out Card */}
//       <Card className="col-span-1 md:col-span-2 lg:col-span-3">
//         <CardHeader>
//           <CardTitle>Daily Product In/Out</CardTitle>
//           <CardDescription>A table or chart showing the daily inflow and outflow of products.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Customer</TableHead>
//                 <TableHead>Material Name</TableHead>
//                 <TableHead>Material Weight</TableHead>
//                 <TableHead>Price</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {dailyProductData.length > 0 ? (
//                 dailyProductData.map((data, index) => (
//                   <TableRow key={index}>
//                     <TableCell>{data.date}</TableCell>
//                     <TableCell>{data.customer}</TableCell>
//                     <TableCell>{data.materialName}</TableCell>
//                     <TableCell>{data.materialWeight}</TableCell>
//                     <TableCell>{data.price}</TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={5}>No data available</TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* Monthly Total Product In/Out Card */}
//       <Card className="col-span-1 md:col-span-2 lg:col-span-2">
//         <CardHeader>
//           <CardTitle>Monthly Total Product In/Out</CardTitle>
//           <CardDescription>A chart or graph displaying the monthly total product inflow and outflow.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <BarChart className="aspect-[4/3]"
//             data={monthlyProductData}
//           >
//             <CartesianGrid vertical={false} />
//             <XAxis
//               dataKey="month"
//               tickLine={false}
//               tickMargin={10}
//               axisLine={false}
//               tickFormatter={(value: string) => value.slice(0, 3)}
//             />
//             <Bar dataKey="in" fill="#8884d8" />
//             <Bar dataKey="out" fill="#82ca9d" />
//           </BarChart>
//         </CardContent>
//       </Card>

//       {/* High Priority Products Card */}
//       <Card className="col-span-1 lg:col-span-1">
//         <CardHeader>
//           <CardTitle>High Priority Products</CardTitle>
//           <CardDescription>A section highlighting the high priority products, potentially with indicators or labels to make them stand out.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ul className="grid gap-4">
//             {highPriorityProducts.map((product) => (
//               <li key={product.id} className={`flex items-center justify-between px-4 py-2 rounded-md ${
//                 product.priority === "high"
//                   ? "bg-red-500 text-red-50"
//                   : product.priority === "medium"
//                   ? "bg-yellow-500 text-yellow-50"
//                   : "bg-green-500 text-green-50"
//               }`}>
//                 <div className="font-medium">{product.name}</div>
//                 <div className="font-bold">{product.stock}</div>
//               </li>
//             ))}
//           </ul>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default Dashboard;
