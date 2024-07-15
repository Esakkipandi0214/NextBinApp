import React from 'react';
import { Grid, Card, CardHeader, CardContent } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie
} from 'recharts';

const AnalyticsDashboard: React.FC = () => {
  const returningCustomersData = [
    { month: "January", returningCustomers: 45 },
    { month: "February", returningCustomers: 78 },
    { month: "March", returningCustomers: 62 },
    { month: "April", returningCustomers: 35 },
    { month: "May", returningCustomers: 90 },
    { month: "June", returningCustomers: 85 },
  ];

  const sessionsData = [
    { month: "January", sessions: 153 },
    { month: "February", sessions: 210 },
    { month: "March", sessions: 175 },
    { month: "April", sessions: 120 },
    { month: "May", sessions: 260 },
    { month: "June", sessions: 240 },
  ];

  const totalSalesData = [
    { month: "January", totalSales: 780 },
    { month: "February", totalSales: 980 },
    { month: "March", totalSales: 850 },
    { month: "April", totalSales: 720 },
    { month: "May", totalSales: 1100 },
    { month: "June", totalSales: 1050 },
  ];

  return (
    <Grid container spacing={3}>
      {/* Returning Customers */}
      <Grid item xs={12} sm={4}>
        <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <CardHeader title="Returning Customers" style={{ color: '#ffffff' }} />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={returningCustomersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#ffffff" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="returningCustomers" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Sessions */}
      <Grid item xs={12} sm={4}>
        <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <CardHeader title="Sessions" style={{ color: '#ffffff' }} />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#ffffff" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sessions" stroke="#2196f3" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Sales */}
      <Grid item xs={12} sm={4}>
        <Card style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <CardHeader title="Total Sales" style={{ color: '#ffffff' }} />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={totalSalesData} dataKey="totalSales" nameKey="month" fill="#f44336" label />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AnalyticsDashboard;
