import React, { useEffect, useState } from 'react';
import { Grid, Card, CardHeader, CardContent } from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
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

interface TimeFrameStats {
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

  const getStats = (timeFrame: 'day' | 'week' | 'month') => {
    const stats: TimeFrameStats = {};

    orders.forEach(order => {
      let key: string;
      const orderDate = new Date(order.orderDate);

      switch (timeFrame) {
        case 'day':
          key = orderDate.toISOString().split('T')[0];
          break;
        case 'week':
          const startOfWeek = new Date(orderDate.setDate(orderDate.getDate() - orderDate.getDay()));
          key = `${startOfWeek.getFullYear()}-${startOfWeek.getMonth() + 1}-${startOfWeek.getDate()}`;
          break;
        case 'month':
          key = orderDate.toLocaleString('default', { month: 'long', year: 'numeric' });
          break;
      }

      if (!stats[key]) {
        stats[key] = {};
      }

      order.orderItems.forEach((item: OrderItem) => {
        const category = item.category;
        const pricePerKg = parseFloat(item.pricePerKg);
        const weight = parseFloat(item.weight);
        const gain = pricePerKg * weight;

        if (!stats[key][category]) {
          stats[key][category] = { count: 0, gain: 0, weight: 0 };
        }

        stats[key][category].count += 1;
        stats[key][category].gain += gain;
        stats[key][category].weight += weight;
      });
    });

    return Object.keys(stats).map(key => ({
      key,
      ...Object.keys(stats[key]).reduce((acc, category) => ({
        ...acc,
        [`${category}Count`]: stats[key][category].count,
        [`${category}Gain`]: stats[key][category].gain,
        [`${category}Weight`]: stats[key][category].weight,
      }), {}),
    }));
  };

  const dailyStats = getStats('day');
  const weeklyStats = getStats('week');
  const monthlyStats = getStats('month');

  const renderLineChart = (data: any[], title: string) => (
    <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
      <CardHeader title={title} style={{ color: '#ffffff' }} />
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="key" stroke="#ffffff" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: '#ffffff' }} />
            <Legend />
            {Object.keys(data[0] || {}).filter(key => key.endsWith('Count')).map((key) => (
              <Line key={key} type="monotone" dataKey={key} stroke="#4caf50" name={key.replace('Count', '') + ' Count'} />
            ))}
            {Object.keys(data[0] || {}).filter(key => key.endsWith('Gain')).map((key) => (
              <Line key={key} type="monotone" dataKey={key} stroke="#2196f3" name={key.replace('Gain', '') + ' Gain'} />
            ))}
            {Object.keys(data[0] || {}).filter(key => key.endsWith('Weight')).map((key) => (
              <Line key={key} type="monotone" dataKey={key} stroke="#ff9800" name={key.replace('Weight', '') + ' Weight'} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderAreaChart = (data: any[], title: string) => (
    <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
      <CardHeader title={title} style={{ color: '#ffffff' }} />
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="key" stroke="#ffffff" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: '#ffffff' }} />
            <Legend />
            {Object.keys(data[0] || {}).filter(key => key.endsWith('Count')).map((key) => (
              <Area key={key} type="monotone" dataKey={key} stroke="#4caf50" fill="#4caf50" name={key.replace('Count', '') + ' Count'} />
            ))}
            {Object.keys(data[0] || {}).filter(key => key.endsWith('Gain')).map((key) => (
              <Area key={key} type="monotone" dataKey={key} stroke="#2196f3" fill="#2196f3" name={key.replace('Gain', '') + ' Gain'} />
            ))}
            {Object.keys(data[0] || {}).filter(key => key.endsWith('Weight')).map((key) => (
              <Area key={key} type="monotone" dataKey={key} stroke="#ff9800" fill="#ff9800" name={key.replace('Weight', '') + ' Weight'} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderBarChart = (data: any[], title: string) => (
    <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
      <CardHeader title={title} style={{ color: '#ffffff' }} />
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="key" stroke="#ffffff" />
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
      {/* Daily Stats */}
      <Grid item xs={12}>
        {renderLineChart(dailyStats, 'Material Stats Day-Wise')}
      </Grid>

      {/* Weekly Stats */}
      <Grid item xs={12}>
        {renderAreaChart(weeklyStats, 'Material Stats Week-Wise')}
      </Grid>

      {/* Monthly Stats */}
      <Grid item xs={12}>
        {renderBarChart(monthlyStats, 'Material Stats Month-Wise')}
      </Grid>
    </Grid>
  );
};

export default AnalyticsDashboard;
