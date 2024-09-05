import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UsersIcon } from 'lucide-react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const WeeklyStatistics: React.FC = () => {
  const [newCustomersThisWeek, setNewCustomersThisWeek] = useState<number>(0);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const today = new Date();

        // Start of the week (Monday) (UTC)
        const startOfWeek = new Date(today);
        startOfWeek.setUTCDate(today.getUTCDate() - today.getUTCDay() + 1); // Monday
        startOfWeek.setUTCHours(0, 0, 0, 0);
        const formattedStartOfWeek = startOfWeek.toISOString();

        // End of the week (Sunday) (UTC)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // Sunday
        endOfWeek.setUTCHours(23, 59, 59, 999);
        const formattedEndOfWeek = endOfWeek.toISOString();

        const customersRef = collection(db, 'users');
        const weekQuery = query(
          customersRef,
          where('role', '==', 'customer'),  
          where('created', '>=', formattedStartOfWeek),
          where('created', '<=', formattedEndOfWeek)
        );

        const weekSnap = await getDocs(weekQuery);
        setNewCustomersThisWeek(weekSnap.size);
      } catch (error) {
        console.error("Error fetching weekly customer data: ", error);
      }
    };

    fetchCustomerData();
  }, []);

  // Format for display
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setUTCDate(today.getUTCDate() - today.getUTCDay() + 1); // Monday
  startOfWeek.setUTCHours(0, 0, 0, 0);
  const formattedStartOfWeek = startOfWeek.toDateString();

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // Sunday
  endOfWeek.setUTCHours(23, 59, 59, 999);
  const formattedEndOfWeek = endOfWeek.toDateString();

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-green-700">New Customers This Week</CardTitle>
        <UsersIcon className="w-6 h-6 text-green-700" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-green-700">{newCustomersThisWeek}</div>
        <p className="text-green-600">
          <span className="font-medium">{`${formattedStartOfWeek} - ${formattedEndOfWeek}`}</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default WeeklyStatistics;
