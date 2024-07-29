import React, { useEffect, useState } from 'react';
import { Grid, Card, CardHeader, CardContent } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../firebase"; // Adjust the import path as necessary

interface OrderItem {
  category: string;
  pricePerKg: string;
  weight: string;
}

interface Order {
  orderDate: string;
  orderItems: OrderItem[];
}

interface CategoryStats {
  count: number;
  gain: number;
  weight: number;
}

interface MonthlyStats {
  [key: string]: CategoryStats;
}

const AnalyticsDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const fetchedOrders = querySnapshot.docs.map(doc => doc.data() as Order);
        setOrders(fetchedOrders);
      } catch (error) {
        setError("Error fetching orders.");
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  const getCurrentMonthStats = () => {
    const stats: MonthlyStats = {};
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the month

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      
      if (orderDate >= startOfMonth && orderDate <= endOfMonth) {
        order.orderItems.forEach(item => {
          const category = item.category;
          const pricePerKg = parseFloat(item.pricePerKg);
          const weight = parseFloat(item.weight);
          const gain = pricePerKg * weight;

          if (!stats[category]) {
            stats[category] = { count: 0, gain: 0, weight: 0 };
          }

          stats[category].count += 1;
          stats[category].gain += gain;
          stats[category].weight += weight;
        });
      }
    });

    // Convert the stats object to an array suitable for rendering
    return Object.keys(stats).map(category => ({
      category,
      count: stats[category].count,
      gain: stats[category].gain,
      weight: stats[category].weight,
    }));
  };

  const monthStats = getCurrentMonthStats();

  const renderAreaChart = (data: any[], title: string) => (
    <Card style={{ backgroundColor: "#f1faee" }}>
      <CardHeader title={title} className=' text-gray-900' />
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data} stackOffset="expand">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" stroke="#ffffff" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: '#ffffff' }} />
            <Legend />
            <Area type="monotone" dataKey="count" stroke="#4caf50" fill="#4caf50" name="Count" />
            <Area type="monotone" dataKey="gain" stroke="#2196f3" fill="#2196f3" name="Gain" />
            <Area type="monotone" dataKey="weight" stroke="#ff9800" fill="#ff9800" name="Weight" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      {/* Monthly Stats */}
      <Grid item xs={12}>
        {renderAreaChart(monthStats, 'Materials Ordered This Month')}
      </Grid>
    </Grid>
  );
};

export default AnalyticsDashboard;
