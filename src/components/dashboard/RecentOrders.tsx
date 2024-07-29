import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

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
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

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
        
        const order = {
          id: doc.id,
          ...data,
          totalWeight,
          categories,
        } as Order;

        fetchedOrders.push(order);
      }

      setOrders(fetchedOrders);
    };

    fetchOrders();
  }, []);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

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

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const renderPaginationButtons = () => {
    const pages = [];

    // If there are more than 5 pages, we show ellipses (...) and a subset of pages
    if (totalPages > 3) {
      pages.push(
        <Button key="first" onClick={() => paginate(1)} disabled={currentPage === 1} className="m-1">
          First
        </Button>
      );
      pages.push(
        <Button key="prev" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="m-1">
          Previous
        </Button>
      );

      if (currentPage > 2) {
        pages.push(<span key="start-ellipsis" className="m-1">...</span>);
      }

      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <Button key={i} onClick={() => paginate(i)} disabled={currentPage === i} className="m-1">
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(<span key="end-ellipsis" className="m-1">...</span>);
      }

      pages.push(
        <Button key="next" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="m-1">
          Next
        </Button>
      );
      pages.push(
        <Button key="last" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="m-1">
          Last
        </Button>
      );
    } else {
      // If there are 5 or fewer pages, show them all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button key={i} onClick={() => paginate(i)} disabled={currentPage === i} className="m-1">
            {i}
          </Button>
        );
      }
    }

    return pages;
  };

  return (
    <Card style={{ backgroundColor: "#f1faee" }}>
      <CardHeader>
        <CardTitle style={{ color: "black" }}>Recent Orders</CardTitle>
        <CardDescription style={{ color: "black" }}>A table showing the most recent orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ color: "black" }}>Order ID</TableHead>
              <TableHead style={{ color: "black" }}>Date</TableHead>
              <TableHead style={{ color: "black" }}>Customer Name</TableHead>
              <TableHead style={{ color: "black" }}>Payment</TableHead>
              <TableHead style={{ color: "black" }}>Time</TableHead>
              <TableHead style={{ color: "black" }}>Categories</TableHead>
              <TableHead style={{ color: "black" }}>Total Weight</TableHead>
              <TableHead style={{ color: "black" }}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.map((order, index) => (
              <TableRow key={order.id}>
                <TableCell style={{ color: "black" }}>{indexOfFirstOrder + index + 1}</TableCell>
                <TableCell style={{ color: "black" }}>{order.orderDate}</TableCell>
                <TableCell style={{ color: "black" }}>{order.customerName}</TableCell>
                <TableCell style={{ color: "black" }}>{order.orderPayment}</TableCell>
                <TableCell style={{ color: "black" }}>{order.orderTime}</TableCell>
                <TableCell style={{ color: "black" }}>{order.categories?.join(', ')}</TableCell>
                <TableCell style={{ color: "black" }}>{order.totalWeight}</TableCell>
                <TableCell>
                  <Badge color={getStatusBadgeColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="pagination">
          {renderPaginationButtons()}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
