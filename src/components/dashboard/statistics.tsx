import React, { useEffect, useState } from 'react';
import { Grid, Card, CardHeader, CardContent } from '@mui/material';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
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

interface DailyStats {
  [key: string]: {
    [category: string]: CategoryStats;
  };
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

  const getTodayStats = () => {
    const stats: { [category: string]: CategoryStats } = {};
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
      
      if (orderDate === today) {
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
    return [{
      date: today,
      ...Object.keys(stats).reduce((acc, category) => ({
        ...acc,
        [`${category}Count`]: stats[category].count,
        [`${category}Gain`]: stats[category].gain,
        [`${category}Weight`]: stats[category].weight,
      }), {}),
    }];
  };

  const todayStats = getTodayStats();

  const renderBarChart = (data: any[], title: string) => (
    <Card style={{ backgroundColor: "#f1faee" }}>
      <CardHeader title={title} className=' text-gray-900'/>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#ffffff" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: '#ffffff' }} />
            <Legend />
            {Object.keys(data[0] || {}).filter(key => key.endsWith('Count')).map((key) => (
              <Bar key={key} dataKey={key} fill="#4caf50" name={key.replace('Count', '') + ' Count'} />
            ))}
            {Object.keys(data[0] || {}).filter(key => key.endsWith('Gain')).map((key) => (
              <Bar key={key} dataKey={key} fill="#2196f3" name={key.replace('Gain', '') + ' Gain'} />
            ))}
            {Object.keys(data[0] || {}).filter(key => key.endsWith('Weight')).map((key) => (
              <Bar key={key} dataKey={key} fill="#ff9800" name={key.replace('Weight', '') + ' Weight'} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      {/* Today's Stats */}
      <Grid item xs={12}>
        {renderBarChart(todayStats, 'Materials Ordered Today')}
      </Grid>
    </Grid>
  );
};

export default AnalyticsDashboard;
