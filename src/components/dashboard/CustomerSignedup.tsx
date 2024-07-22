import React, { useEffect, useState } from 'react';
import { db } from '../../firebase'; // Adjust path if necessary
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from '@/components/ui/button';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  registration: string;
  created: string; // Treat as a string
}

const getOneYearAgoDate = (): Date => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 1);
  return today;
};

const getStartOfPeriod = (period: 'week' | 'month' | 'year'): Date => {
  const today = new Date();
  switch (period) {
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of the week
      return weekStart;
    case 'month':
      return new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month
    case 'year':
      return new Date(today.getFullYear(), 0, 1); // Start of the year
    default:
      return today;
  }
};

const CustomerActivity: React.FC = () => {
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<Customer[]>([]);
  const [newCustomers, setNewCustomers] = useState<Customer[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    const oneYearAgoDate = getOneYearAgoDate();
    const startDate = getStartOfPeriod(period);
    const customersRef = collection(db, 'customers');
    const querySnapshot = await getDocs(customersRef);
    
    const activeCustomerData: Customer[] = [];
    const inactiveCustomerData: Customer[] = [];
    const newCustomerData: Customer[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data() as Omit<Customer, 'id'>;
      const customer: Customer = {
        id: doc.id,
        ...data,
      };

      const createdDate = new Date(customer.created);

      if (createdDate >= oneYearAgoDate) {
        activeCustomerData.push(customer);
      } else {
        inactiveCustomerData.push(customer);
      }

      if (createdDate >= startDate) {
        newCustomerData.push(customer);
      }
    });

    setActiveCustomers(activeCustomerData.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
    setInactiveCustomers(inactiveCustomerData.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
    setNewCustomers(newCustomerData.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
  };

  return (
    <div>
     

      <Card style={{ backgroundColor: "#2C4E80" }}>
        <CardHeader>
          <CardTitle style={{ color: "white" }}>Active Customers</CardTitle>
          <CardDescription style={{ color: "white" }}>Customers who returned within a year</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ color: "white" }}>Registration Number</TableHead>
                <TableHead style={{ color: "white" }}>First Name</TableHead>
                <TableHead style={{ color: "white" }}>Last Name</TableHead>
                <TableHead style={{ color: "white" }}>Phone Number</TableHead>
                <TableHead style={{ color: "white" }}>Signup Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeCustomers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell style={{ color: "white" }}>{customer.registration}</TableCell>
                  <TableCell style={{ color: "white" }}>{customer.firstName}</TableCell>
                  <TableCell style={{ color: "white" }}>{customer.lastName}</TableCell>
                  <TableCell style={{ color: "white" }}>{customer.phone}</TableCell>
                  <TableCell style={{ color: "white" }}>{new Date(customer.created).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: "#2C4E80", marginTop: '20px' }}>
        <CardHeader>
          <CardTitle style={{ color: "white" }}>Inactive Customers</CardTitle>
          <CardDescription style={{ color: "white" }}>Customers who haven't returned in over a year</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ color: "white" }}>Registration Number</TableHead>
                <TableHead style={{ color: "white" }}>First Name</TableHead>
                <TableHead style={{ color: "white" }}>Last Name</TableHead>
                <TableHead style={{ color: "white" }}>Phone Number</TableHead>
                <TableHead style={{ color: "white" }}>Signup Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inactiveCustomers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell style={{ color: "white" }}>{customer.registration}</TableCell>
                  <TableCell style={{ color: "white" }}>{customer.firstName}</TableCell>
                  <TableCell style={{ color: "white" }}>{customer.lastName}</TableCell>
                  <TableCell style={{ color: "white" }}>{customer.phone}</TableCell>
                  <TableCell style={{ color: "white" }}>{new Date(customer.created).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className='mt-4'>
        <label className='text-xl flex'>
          <p className='text-white mr-2'>Filter by:</p>
          <select value={period} onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </label>
      </div>
      <Card style={{ backgroundColor: "#2C4E80", marginTop: '20px' }}>
        <CardHeader>
          <CardTitle style={{ color: "white" }}>New Customers Signed Up</CardTitle>
          <CardDescription style={{ color: "white" }}>Customers who signed up in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ color: "white" }}>Registration Number</TableHead>
                <TableHead style={{ color: "white" }}>First Name</TableHead>
                <TableHead style={{ color: "white" }}>Last Name</TableHead>
                <TableHead style={{ color: "white" }}>Phone Number</TableHead>
                <TableHead style={{ color: "white" }}>Signup Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newCustomers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell style={{ color: "white" }}>{customer.registration}</TableCell>
                  <TableCell style={{ color: "white" }}>{customer.firstName}</TableCell>
                  <TableCell style={{ color: "white" }}>{customer.lastName}</TableCell>
                  <TableCell style={{ color: "white" }}>{customer.phone}</TableCell>
                  <TableCell style={{ color: "white" }}>{new Date(customer.created).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerActivity;