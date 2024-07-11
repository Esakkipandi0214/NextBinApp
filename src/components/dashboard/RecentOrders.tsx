// RecentOrders.js

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
// import { BoxIcon } from "@/components/ui/icons"; // Importing BoxIcon as an example

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
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
        <CardDescription>A table showing the most recent orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Materials</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge color={order.status === "Shipped" ? "success" : "warning"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ul>
                    {order.materials.map((material) => (
                      <li key={material.id}>
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
