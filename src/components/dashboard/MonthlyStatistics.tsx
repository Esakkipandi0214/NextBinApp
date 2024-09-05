import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UsersIcon } from 'lucide-react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const MonthlyStatistics: React.FC = () => {
  const [newCustomersThisMonth, setNewCustomersThisMonth] = useState<number>(0);

  // Format dates for display
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Fixed start date to the 1st day
  startOfMonth.setUTCHours(0, 0, 0, 0);
  
  // End of the month (last day)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setUTCHours(23, 59, 59, 999);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const formattedStartOfMonth = startOfMonth.toISOString();
        const formattedEndOfMonth = endOfMonth.toISOString();

        console.log("Fetching customers from:", formattedStartOfMonth, "to:", formattedEndOfMonth);

        const customersRef = collection(db, 'users');
        const monthQuery = query(
          customersRef,
          where('role', '==', 'customer'),  
          where('created', '>=', formattedStartOfMonth),
          where('created', '<=', formattedEndOfMonth)
        );

        const monthSnap = await getDocs(monthQuery);

        const customerData: Array<{ name: string, created: string }> = [];
        monthSnap.forEach((doc) => {
          const data = doc.data();
          customerData.push({
            name: data.name,
            created: data.created,
          });
        });

        console.log("Filtered Customers:", customerData);
        setNewCustomersThisMonth(customerData.length);
      } catch (error) {
        console.error("Error fetching monthly customer data: ", error);
      }
    };

    fetchCustomerData();
  }, [startOfMonth, endOfMonth]);

  const formattedStartOfMonth = startOfMonth.toDateString();
  const formattedEndOfMonth = endOfMonth.toDateString();

  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-red-700">New Customers This Month</CardTitle>
        <UsersIcon className="w-6 h-6 text-red-700" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-red-700">{newCustomersThisMonth}</div>
        <p className="text-red-600">
          <span className="font-medium">{`${formattedStartOfMonth} - ${formattedEndOfMonth}`}</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default MonthlyStatistics;
