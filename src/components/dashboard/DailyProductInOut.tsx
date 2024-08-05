import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface OrderItem {
  category: string;
  subCategory: string;
}

interface DailyProductData {
  date: string;
  customer: string;
  orderItems: OrderItem[];
  materialWeight: number;
  price: number;
}

const DailyProductInOut: React.FC = () => {
  const [dailyProductData, setDailyProductData] = useState<DailyProductData[]>([]);

  useEffect(() => {
    const fetchDailyProducts = async () => {
      try {
        const db = getFirestore();
        const ordersCollection = collection(db, 'orders');
        // Get today's date in the required format
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0]; // Format date as yyyy-MM-dd

        console.log("Querying orders for date:", formattedToday);

        // Create a query to fetch today's orders
        const ordersSnapshot = await getDocs(
          query(
            ordersCollection,
            where('orderDate', '==', formattedToday),
            orderBy('orderDate', 'desc')
          )
        );
        console.log("Order Collection:", ordersSnapshot)
        const updatedDailyProductData: DailyProductData[] = [];
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          const categories = data.orderItems.map((item: { category: any; }) => item.category);
          console.log("Fetched order data:", data);
          const dailyProduct: DailyProductData = {
            ...data,
            date: data.orderDate,
            customer: data.customerName,
            orderItems: categories,
            materialWeight: parseFloat(data.totalWeight), // Assuming orderWeight is a string, convert to number if necessary
            price: parseFloat(data.orderPayment), // Assuming orderPayment is a string, convert to number if necessary
          };
          updatedDailyProductData.push(dailyProduct);
        });

        console.log("Updated daily product data:", updatedDailyProductData);
        setDailyProductData(updatedDailyProductData);
      } catch (error) {
        console.error("Error fetching daily products:", error);
      }
    };

    fetchDailyProducts();
  }, []); // useEffect dependency array
  console.log("Daily ordes:",dailyProductData)

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3" style={{ backgroundColor: "white" }}>
      <CardHeader>
        <CardTitle style={{ color: "black" }}>Daily Product In/Out</CardTitle>
        <CardDescription style={{ color: "black" }}>A table showing the daily inflow and outflow of products.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ color: "black" }}>Date</TableHead>
              <TableHead style={{ color: "black" }}>Customer</TableHead>
              <TableHead style={{ color: "black" }}>Material Name</TableHead>
              <TableHead style={{ color: "black" }}>Material Weight</TableHead>
              <TableHead style={{ color: "black" }}>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dailyProductData.map((data, index) => (
              <TableRow key={index}>
                <TableCell style={{ color: "black" }}>{data.date}</TableCell>
                <TableCell style={{ color: "black" }}>{data.customer}</TableCell>
                <TableCell style={{ color: "black" }}>{data.orderItems.join(', ')}</TableCell>
                <TableCell style={{ color: "black" }}>{data.materialWeight}</TableCell>
                <TableCell style={{ color: "black" }}>{data.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DailyProductInOut;
