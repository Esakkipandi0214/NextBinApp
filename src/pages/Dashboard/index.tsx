import Layout from "@/components/layout";
import React from 'react'
import DashBoard from "@/components/dashboard/dash"
const Dashboard = () => {
  return (
    <Layout>
    <div>
        {/* <Dashboard/> */}
    <DashBoard>

    </DashBoard>
    </div>
    </Layout>
  )
}

export default Dashboard

// /**
//  * v0 by Vercel.
//  * @see https://v0.dev/t/aWDceEN9MdQ
//  * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
//  */
// import React from 'react';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// import { CartesianGrid, XAxis, Bar, BarChart, Line, LineChart } from "recharts";
// import { ChartTooltipContent, ChartTooltip, ChartContainer } from "@/components/ui/chart";

// function Component() {
//   const dailyProductData = [
//     { date: "2023-06-01", in: 50, out: 20 },
//     { date: "2023-06-02", in: 60, out: 30 },
//     { date: "2023-06-03", in: 45, out: 15 },
//     { date: "2023-06-04", in: 55, out: 25 },
//     { date: "2023-06-05", in: 70, out: 35 },
//     { date: "2023-06-06", in: 40, out: 10 },
//     { date: "2023-06-07", in: 65, out: 40 },
//   ];
  
//   const monthlyProductData = [
//     { month: "Jan", in: 1200, out: 800 },
//     { month: "Feb", in: 1500, out: 900 },
//     { month: "Mar", in: 1800, out: 1100 },
//     { month: "Apr", in: 1600, out: 1000 },
//     { month: "May", in: 1900, out: 1200 },
//     { month: "Jun", in: 2000, out: 1300 },
//   ];
  
//   const highPriorityProducts = [
//     { id: 1, name: "Product A", stock: 25, priority: "high" },
//     { id: 2, name: "Product B", stock: 15, priority: "high" },
//     { id: 3, name: "Product C", stock: 8, priority: "high" },
//     { id: 4, name: "Product D", stock: 30, priority: "medium" },
//     { id: 5, name: "Product E", stock: 45, priority: "low" },
//   ];
  
//   return (
    
//     React.createElement("div", { className: "grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3" },
//       React.createElement(Card, { className: "col-span-1 md:col-span-2 lg:col-span-3" },
//         React.createElement(CardHeader, null,
//           React.createElement(CardTitle, null, "Daily Product In/Out"),
//           React.createElement(CardDescription, null, "A table or chart showing the daily inflow and outflow of products.")
//         ),
//         React.createElement(CardContent, null,
//           React.createElement(Table, null,
//             React.createElement(TableHeader, null,
//               React.createElement(TableRow, null,
//                 React.createElement(TableHead, null, "Date"),
//                 React.createElement(TableHead, null, "In"),
//                 React.createElement(TableHead, null, "Out")
//               )
//             ),
//             React.createElement(TableBody, null,
//               dailyProductData.map((data) =>
//                 React.createElement(TableRow, { key: data.date },
//                   React.createElement(TableCell, null, data.date),
//                   React.createElement(TableCell, null, data.in),
//                   React.createElement(TableCell, null, data.out)
//                 )
//               )
//             )
//           )
//         )
//       ),
//       React.createElement(Card, { className: "col-span-1 md:col-span-2 lg:col-span-2" },
//         React.createElement(CardHeader, null,
//           React.createElement(CardTitle, null, "Monthly Total Product In/Out"),
//           React.createElement(CardDescription, null, "A chart or graph displaying the monthly total product inflow and outflow.")
//         ),
//         React.createElement(CardContent, null,
//           React.createElement(BarchartChart, { className: "aspect-[4/3]" })
//         )
//       ),
//       React.createElement(Card, { className: "col-span-1 lg:col-span-1" },
//         React.createElement(CardHeader, null,
//           React.createElement(CardTitle, null, "High Priority Products"),
//           React.createElement(CardDescription, null, "A section highlighting the high priority products, potentially with indicators or labels to make them stand out.")
//         ),
//         React.createElement(CardContent, null,
//           React.createElement("ul", { className: "grid gap-4" },
//             highPriorityProducts.map((product) =>
//               React.createElement("li", { key: product.id, className: `flex items-center justify-between px-4 py-2 rounded-md ${
//                 product.priority === "high"
//                   ? "bg-red-500 text-red-50"
//                   : product.priority === "medium"
//                   ? "bg-yellow-500 text-yellow-50"
//                   : "bg-green-500 text-green-50"
//               }` },
//                 React.createElement("div", { className: "font-medium" }, product.name),
//                 React.createElement("div", { className: "font-bold" }, product.stock)
//               )
//             )
//           )
//         )
//       )
//     )
//   );
// }

// function BarchartChart(props: any) {
//   return (
//     React.createElement("div", Object.assign({}, props),
//     //   React.createElement(ChartContainer, {
//     //     config: {
//     //       desktop: {
//     //         label: "Desktop",
//     //         color: "hsl(var(--chart-1))"
//     //       }
//     //     },
//     //     className: "min-h-[300px]"
//     //   },
//         React.createElement(BarChart, {
//           accessibilityLayer: true,
//           data: [
//             { month: "January", desktop: 186 },
//             { month: "February", desktop: 305 },
//             { month: "March", desktop: 237 },
//             { month: "April", desktop: 73 },
//             { month: "May", desktop: 209 },
//             { month: "June", desktop: 214 }
//           ]
//         },
//           React.createElement(CartesianGrid, { vertical: false }),
//           React.createElement(XAxis, {
//             dataKey: "month",
//             tickLine: false,
//             tickMargin: 10,
//             axisLine: false,
//             tickFormatter: (value) => value.slice(0, 3)
//           }),
//          // React.createElement(ChartTooltip, { cursor: false, content: React.createElement(ChartTooltipContent, { hideLabel: true }) }),
//           //React.createElement(Bar, { dataKey: "desktop", fill: "var(--color-desktop)", radius: 8 })
//         )
      
//     )
//   );
// }

// function LinechartChart(props: any) {
//   return (
//     React.createElement("div", Object.assign({}, props),
//     //   React.createElement(ChartContainer, {
//     //     config: {
//     //       desktop: {
//     //         label: "Desktop",
//     //         color: "hsl(var(--chart-1))"
//     //       }
//     //     }
//     //   },
//         React.createElement(LineChart, {
//           accessibilityLayer: true,
//           data: [
//             { month: "January", desktop: 186 },
//             { month: "February", desktop: 305 },
//             { month: "March", desktop: 237 },
//             { month: "April", desktop: 73 },
//             { month: "May", desktop: 209 },
//             { month: "June", desktop: 214 }
//           ],
//           margin: {
//             left: 12,
//             right: 12
//           }
//         },
//           React.createElement(CartesianGrid, { vertical: false }),
//           React.createElement(XAxis, {
//             dataKey: "month",
//             tickLine: false,
//             axisLine: false,
//             tickMargin: 8,
//             tickFormatter: (value) => value.slice(0, 3)
//           }),
//          // React.createElement(ChartTooltip, { cursor: false, content: React.createElement(ChartTooltipContent, { hideLabel: true }) }),
//          // React.createElement(Line, { dataKey: "desktop", type: "natural", stroke: "var(--color-desktop)", strokeWidth: 2, dot: false })
//         )
      
//     )
//   );
// }

// export default Component;
