import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UsersIcon } from 'lucide-react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const DailyStatistics: React.FC = () => {
  const [newCustomersToday, setNewCustomersToday] = useState<number>(0);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const today = new Date();
        
        // Start of today (UTC)
        const startOfDay = new Date(today.setUTCHours(0, 0, 0, 0));
        const formattedStartOfDay = startOfDay.toISOString();

        // End of today (UTC)
        const endOfDay = new Date(today.setUTCHours(23, 59, 59, 999));
        const formattedEndOfDay = endOfDay.toISOString();

        const customersRef = collection(db, 'customers');
        const todayQuery = query(
          customersRef,
          where('created', '>=', formattedStartOfDay),
          where('created', '<=', formattedEndOfDay)
        );

        const todaySnap = await getDocs(todayQuery);
        setNewCustomersToday(todaySnap.size);
      } catch (error) {
        console.error("Error fetching daily customer data: ", error);
      }
    };

    fetchCustomerData();
  }, []);

  const today = new Date();
  const formattedToday = new Date(today.setUTCHours(0, 0, 0, 0)).toDateString();

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-blue-700">New Customers Today</CardTitle>
        <UsersIcon className="w-6 h-6 text-blue-700" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-blue-700">{newCustomersToday}</div>
        <p className="text-blue-600">
          <span className="font-medium">{formattedToday}</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default DailyStatistics;
