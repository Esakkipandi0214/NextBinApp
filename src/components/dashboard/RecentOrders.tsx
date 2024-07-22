import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getFirestore, collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';

interface OrderItem {
  category: string;
  weight: number;
  subCategory: string;
}

interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  orderPayment: string;
  orderTime: string;
  orderItems: OrderItem[];
  status: string;
  totalWeight?: number;
  categories?: string[];
  subCategories?: string[];
}

const RecentOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const db = getFirestore();
      const ordersRef = collection(db, 'orders');
      const ordersSnapshot = await getDocs(query(ordersRef, orderBy('orderDate', 'desc')));
      const fetchedOrders: Order[] = [];

      for (const doc of ordersSnapshot.docs) {
        const data = doc.data() as Omit<Order, 'id'>;
        const totalWeight = data.orderItems.reduce((acc, item) => acc + item.weight, 0);
        const categories = data.orderItems.map(item => item.category);
        
        // const orderItemsWithSubCategories = await Promise.all(data.orderItems.map(async item => {
        //   const subCategoryDocRef = doc(db, 'subCategories', item.subCategory);
        //   const subCategoryDoc = await getDoc(subCategoryDocRef);
        //   return {
        //     ...item,
        //     subCategory: subCategoryDoc.exists() ? subCategoryDoc.data().name : 'N/A'
        //   };
        // }));

        // const subCategories = orderItemsWithSubCategories.map(item => item.subCategory);
        // subCategories
        // orderItemsWithSubCategories,
        const order = {
          id: doc.id,
          ...data,
          orderItems: totalWeight,
          categories,
        } as unknown as Order;

        fetchedOrders.push(order);
      }

      setOrders(fetchedOrders);
    };

    fetchOrders();
  }, []); // Run once on component mount

  const getStatusBadgeColor = (status: string): string => {
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
              <TableHead style={{ color: "white" }}>Categories</TableHead>
              {/* <TableHead style={{ color: "white" }}>SubCategories</TableHead> */}
              <TableHead style={{ color: "white" }}>Total Weight</TableHead>
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
                <TableCell style={{ color: "white" }}>{order.categories?.join(', ')}</TableCell>
                {/* <TableCell style={{ color: "white" }}>{order.subCategories?.join(', ')}</TableCell> */}
                <TableCell style={{ color: "white" }}>{order.totalWeight}</TableCell>
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