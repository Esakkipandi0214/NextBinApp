// RecentOrders.tsx

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  orderPayment: string;
  orderTime: string;
  orderType: string;
  orderWeight: string;
  status: string;
}

const RecentOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const db = getFirestore();
      const ordersRef = collection(db, 'orders');
      const ordersSnapshot = await getDocs(query(ordersRef, orderBy('orderDate', 'desc')));
      console.log("Order Collection recent:", ordersSnapshot);
      const fetchedOrders: Order[] = [];
      ordersSnapshot.forEach((doc) => {
        const order = {
          id: doc.id,
          ...doc.data()
        } as Order;
        fetchedOrders.push(order);
      });
      console.log("Order Collection:", fetchedOrders);
      setOrders(fetchedOrders);
    };

    fetchOrders();
  }, []); // Run once on component mount

  const getStatusBadgeColor = (status: string): string => {
    // Ensure status is defined and not null or undefined
    const statusLowerCase = status ? status.toLowerCase() : '';

    switch (statusLowerCase) {
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

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
              <TableHead style={{ color: "white" }}>Customer Name</TableHead>
              <TableHead style={{ color: "white" }}>Payment</TableHead>
              <TableHead style={{ color: "white" }}>Time</TableHead>
              <TableHead style={{ color: "white" }}>Type</TableHead>
              <TableHead style={{ color: "white" }}>Weight</TableHead>
              <TableHead style={{ color: "white" }}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={order.id}>
                <TableCell style={{ color: "white" }}>{index + 1}</TableCell>
                <TableCell style={{ color: "white" }}>{order.orderDate}</TableCell>
                <TableCell style={{ color: "white" }}>{order.customerName}</TableCell>
                <TableCell style={{ color: "white" }}>{order.orderPayment}</TableCell>
                <TableCell style={{ color: "white" }}>{order.orderTime}</TableCell>
                <TableCell style={{ color: "white" }}>{order.orderType}</TableCell>
                <TableCell style={{ color: "white" }}>{order.orderWeight}</TableCell>
                <TableCell>
                  <Badge color={getStatusBadgeColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
