// RecentOrders.js

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
  { 
    id: 1, 
    date: "2024-07-12", 
    customer: "John Doe", 
    total: "$123.45", 
    status: "Shipped",
    materials: [
      { id: 101, name: "Material X", quantity: 2 },
      { id: 102, name: "Material Y", quantity: 1 },
    ]
  },
  { 
    id: 2, 
    date: "2024-07-11", 
    customer: "Jane Smith", 
    total: "$456.78", 
    status: "Pending",
    materials: [
      { id: 201, name: "Material Z", quantity: 3 },
    ]
  },
  // Add more orders as needed
];

export default function RecentOrders() {
  return (
    <Card style={{ backgroundColor: "#2C4E80" }}>
      <CardHeader>
        <CardTitle style={{ color: "white" }}>Recent Orders</CardTitle>
        <CardDescription style={{ color: "white" }}>A table showing the most recent orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ color: "white" }}>Order ID</TableHead>
              <TableHead style={{ color: "white" }}>Date</TableHead>
              <TableHead style={{ color: "white" }}>Customer</TableHead>
              <TableHead style={{ color: "white" }}>Total</TableHead>
              <TableHead style={{ color: "white" }}>Status</TableHead>
              <TableHead style={{ color: "white" }}>Materials</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell style={{ color: "white" }}>{order.id}</TableCell>
                <TableCell style={{ color: "white" }}>{order.date}</TableCell>
                <TableCell style={{ color: "white" }}>{order.customer}</TableCell>
                <TableCell style={{ color: "white" }}>{order.total}</TableCell>
                <TableCell>
                  <Badge color={order.status === "Shipped" ? "success" : "warning"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ul>
                    {order.materials.map((material) => (
                      <li key={material.id} style={{ color: "white" }}>
                        {material.name} (Qty: {material.quantity})
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
