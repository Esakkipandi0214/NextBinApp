import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UsersIcon } from 'lucide-react';
import {collection, query, where, getDocs } from "firebase/firestore"; // Adjust path as needed
import { db } from "../../firebase";

interface CustomerStatisticsProps {
  newCustomersToday: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
}

const CustomerStatistics: React.FC<CustomerStatisticsProps> = ({
  newCustomersToday,
  newCustomersThisWeek,
  newCustomersThisMonth,
}) => {
  const [data, setData] = useState<CustomerStatisticsProps>({
    newCustomersToday: 0,
    newCustomersThisWeek: 0,
    newCustomersThisMonth: 0,
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const customersRef = collection(db, 'customers');
        const todayQuery = query(customersRef, where('created', '>=', startOfDay(today.toISOString())));
        const weekQuery = query(customersRef, where('created', '>=', startOfDay(startOfWeek.toISOString())));
        const monthQuery = query(customersRef, where('created', '>=', startOfDay(startOfMonth.toISOString())));

        const [todaySnap, weekSnap, monthSnap] = await Promise.all([
          getDocs(todayQuery),
          getDocs(weekQuery),
          getDocs(monthQuery),
        ]);

        setData({
          newCustomersToday: todaySnap.size,
          newCustomersThisWeek: weekSnap.size,
          newCustomersThisMonth: monthSnap.size,
        });
      } catch (error) {
        console.error("Error fetching customer data: ", error);
      }
    };

    fetchCustomerData();
  }, []);

  const startOfDay = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-blue-700">New Customers Today</CardTitle>
          <UsersIcon className="w-6 h-6 text-blue-700" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-700">{data.newCustomersToday}</div>
          <p className="text-blue-600">
            <span className="font-medium">+5.2%</span> from yesterday
          </p>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-green-700">New Customers This Week</CardTitle>
          <UsersIcon className="w-6 h-6 text-green-700" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-700">{data.newCustomersThisWeek}</div>
          <p className="text-green-600">
            <span className="font-medium">+3.1%</span> from last week
          </p>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-red-700">New Customers This Month</CardTitle>
          <UsersIcon className="w-6 h-6 text-red-700" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-red-700">{data.newCustomersThisMonth}</div>
          <p className="text-red-600">
            <span className="font-medium">+2.7%</span> from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerStatistics;
