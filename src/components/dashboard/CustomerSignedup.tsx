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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const [currentInactivePage, setCurrentInactivePage] = useState(1);
  const customersPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [period, startDate, endDate]);

  const fetchData = async () => {
    const oneYearAgoDate = getOneYearAgoDate();
    const periodStartDate = getStartOfPeriod(period);
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

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (createdDate >= start && createdDate <= end) {
          newCustomerData.push(customer);
        }
      } else {
        if (createdDate >= periodStartDate) {
          newCustomerData.push(customer);
        }
      }
    });

    setActiveCustomers(activeCustomerData.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
    setInactiveCustomers(inactiveCustomerData.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
    setNewCustomers(newCustomerData.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
  };

  const paginate = (pageNumber: number, type: 'active' | 'inactive') => {
    if (type === 'active') {
      setCurrentActivePage(pageNumber);
    } else {
      setCurrentInactivePage(pageNumber);
    }
  };

  const renderPaginationButtons = (totalPages: number, currentPage: number, type: 'active' | 'inactive') => {
    const pages = [];

    // If there are more than 5 pages, we show ellipses (...) and a subset of pages
    if (totalPages > 5) {
      pages.push(
        <Button key="first" onClick={() => paginate(1, type)} disabled={currentPage === 1} className="m-1">
          First
        </Button>
      );
      pages.push(
        <Button key="prev" onClick={() => paginate(currentPage - 1, type)} disabled={currentPage === 1} className="m-1">
          Previous
        </Button>
      );

      if (currentPage > 3) {
        pages.push(<span key="start-ellipsis" className="m-1">...</span>);
      }

      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <Button key={i} onClick={() => paginate(i, type)} disabled={currentPage === i} className="m-1">
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(<span key="end-ellipsis" className="m-1">...</span>);
      }

      pages.push(
        <Button key="next" onClick={() => paginate(currentPage + 1, type)} disabled={currentPage === totalPages} className="m-1">
          Next
        </Button>
      );
      pages.push(
        <Button key="last" onClick={() => paginate(totalPages, type)} disabled={currentPage === totalPages} className="m-1">
          Last
        </Button>
      );
    } else {
      // If there are 5 or fewer pages, show them all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button key={i} onClick={() => paginate(i, type)} disabled={currentPage === i} className="m-1">
            {i}
          </Button>
        );
      }
    }

    return pages;
  };

  const indexOfLastActiveCustomer = currentActivePage * customersPerPage;
  const indexOfFirstActiveCustomer = indexOfLastActiveCustomer - customersPerPage;
  const currentActiveCustomers = activeCustomers.slice(indexOfFirstActiveCustomer, indexOfLastActiveCustomer);
  const totalActivePages = Math.ceil(activeCustomers.length / customersPerPage);

  const indexOfLastInactiveCustomer = currentInactivePage * customersPerPage;
  const indexOfFirstInactiveCustomer = indexOfLastInactiveCustomer - customersPerPage;
  const currentInactiveCustomers = inactiveCustomers.slice(indexOfFirstInactiveCustomer, indexOfLastInactiveCustomer);
  const totalInactivePages = Math.ceil(inactiveCustomers.length / customersPerPage);

  return (
    <div>
      {/* <Card style={{ backgroundColor: "#2C4E80" }}>
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
              {currentActiveCustomers.map(customer => (
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
          <div className="pagination">
            {renderPaginationButtons(totalActivePages, currentActivePage, 'active')}
          </div>
        </CardContent>
      </Card> */}

      <Card style={{ backgroundColor: "#2C4E80", marginTop: '20px' }}>
        <CardHeader>
          <CardTitle style={{ color: "white" }}>Inactive Customers</CardTitle>
          <CardDescription style={{ color: "white" }}>Customers who haven&rsquo;t returned in over a year</CardDescription>
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
              {currentInactiveCustomers.map(customer => (
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
          <div className="pagination">
            {renderPaginationButtons(totalInactivePages, currentInactivePage, 'inactive')}
          </div>
        </CardContent>
      </Card>
<div className='flex'>
      <div className='mt-4'>
        <label className='text-xl flex'>
          <p className='text-white mr-2'>Start Date:</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 p-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>

      <div className='mt-4 ml-4'>
        <label className='text-xl flex'>
          <p className='text-white mr-2'>End Date:</p>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 p-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>
      </div>
      <Card style={{ backgroundColor: "#2C4E80", marginTop: '20px' }}>
        <CardHeader>
          <CardTitle style={{ color: "white" }}>New Customers Signed Up</CardTitle>
          <CardDescription style={{ color: "white" }}>Customers who signed up in the selected period or date</CardDescription>
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
