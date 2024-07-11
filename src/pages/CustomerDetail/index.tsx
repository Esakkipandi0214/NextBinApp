import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import Link from 'next/link';
import { db } from "../../firebase"; // Assuming you've exported db from your Firebase initialization file
import { collection, getDocs } from "firebase/firestore"; 
import { IoCallOutline } from "react-icons/io5";
import { BsChat } from "react-icons/bs";
import { MdOutlineEmail } from "react-icons/md";
// import Image from '../../../public/boy (1).png'
import Image from 'next/image';

interface CustomerProps {
  name: string;
  joinDate: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastLogin: string;
  lastOrderDate: string;
  lifetimeOrders: number;
}

// Main component
const Component: React.FC = () => {
  // State for customers, selected customer, search query, and filtered customers
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProps | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerProps[]>([]);

  // Fetch customers from Firebase Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      const customersCollection = collection(db, 'customers'); // Replace 'customers' with your collection name
      const querySnapshot = await getDocs(customersCollection);
      const customerData = querySnapshot.docs.map(doc => doc.data() as CustomerProps);
      setCustomers(customerData);
    };

    fetchCustomers();
  }, []);

  // Function to handle customer selection
  const handleCustomerSelect = (customer: CustomerProps) => {
    setSelectedCustomer(customer);
    setSearchQuery(''); // Clear search query after selection if desired
    setFilteredCustomers([]); // Clear filtered customers list after selection if desired
  };

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredCustomers([]);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    }
  };

  // Function to calculate days since last order
  const calculateDaysSinceLastOrder = (lastOrderDate: string) => {
    const lastOrder = new Date(lastOrderDate);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - lastOrder.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid gap-8">
          <div className="grid gap-8">
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold">Customer List</h2>
              <input
                type="text"
                className="border border-gray-300 rounded w-1/2 py-2"
                placeholder="Search customers by name"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery.length === 0 && (
                <CustomerList customers={customers} onCustomerSelect={handleCustomerSelect} calculateDaysSinceLastOrder={calculateDaysSinceLastOrder} />
              )}
              {searchQuery.length > 0 && (
                <CustomerList customers={filteredCustomers} onCustomerSelect={handleCustomerSelect} calculateDaysSinceLastOrder={calculateDaysSinceLastOrder} />
              )}
            </div>
          </div>
          <div className="grid gap-4">
            {selectedCustomer && (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    <Image src="/boy (1).png" alt="Profile" className="object-cover w-full h-full" />
                  </div>
                  <div className="grid gap-1">
                    <h1 className="text-2xl font-bold">{selectedCustomer.name}</h1>
                    <p className="text-muted-foreground">Joined: {selectedCustomer.joinDate}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <h2 className="text-xl font-semibold">Last Order</h2>
                    <OrderDetails orderNumber="123456" orderDate={selectedCustomer.lastOrderDate} totalAmount={149.99} status="Fulfilled" />
                  </div>
                  <Separator />
                  <div className="grid gap-2">
                    <h2 className="text-xl font-semibold">Order History</h2>
                    <OrderHistoryTable />
                  </div>
                </div>
                <div className="grid gap-4">
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                  <div className="grid gap-2 text-sm">
                    <ContactDetail label="Email" value={<Link href="#" className="text-blue-600 underline" prefetch={false}>{selectedCustomer.email}</Link>} />
                    <ContactDetail label="Phone" value={<Link href="#" className="text-blue-600 underline" prefetch={false}>{selectedCustomer.phone}</Link>} />
                    <ContactDetail label="Address" value={selectedCustomer.address} />
                    <div className='flex  gap-2'>
                      <button><IoCallOutline className='border-2 border-zinc-500 w-8 h-5 '/></button>
                      <button><BsChat className='border-2 border-zinc-500 w-8 h-5'/></button>
                      <button><MdOutlineEmail className='border-2 border-zinc-500 w-8 h-5'/></button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// CustomerList component to display list of customers
const CustomerList: React.FC<{ customers: CustomerProps[]; onCustomerSelect: (customer: CustomerProps) => void; calculateDaysSinceLastOrder: (lastOrderDate: string) => number }> = ({ customers, onCustomerSelect, calculateDaysSinceLastOrder }) => (
  <div className="grid gap-4">
    {customers.map((customer, index) => {
      const daysSinceLastOrder = calculateDaysSinceLastOrder(customer.lastOrderDate);
      let highlightClass = '';

      // Determine highlight class based on frequency days
      if (daysSinceLastOrder >= 20) {
        highlightClass = 'bg-red-100'; // Red background for 20 days or more
      } else if (daysSinceLastOrder >= 15) {
        highlightClass = 'bg-yellow-100'; // Yellow background for 10-15 days
      }

      return (
        <div
          key={index}
          className={`cursor-pointer border border-gray-200 p-2 rounded-md w-1/2 ${highlightClass}`}
          onClick={() => onCustomerSelect(customer)}
        >
          <h3 className="text-lg font-medium">{customer.name}</h3>
          <p className="text-sm text-gray-500">
            Last order: {daysSinceLastOrder} days ago
          </p>
        </div>
      );
    })}
  </div>
);

// Separator component
const Separator = () => <hr className="border-gray-300 my-4" />;

// OrderDetails component
const OrderDetails: React.FC<{ orderNumber: string; orderDate: string; totalAmount: number; status: string }> = ({ orderNumber, orderDate, totalAmount, status }) => (
  <div className="grid gap-1 text-sm">
    <OrderDetailRow label="Order #" value={orderNumber} />
    <OrderDetailRow label="Date" value={orderDate} />
    <OrderDetailRow label="Total" value={`$${totalAmount}`} />
    <OrderDetailRow label="Status" value={<Badge variant={status === "Fulfilled" ? "secondary" : "outline"}>{status}</Badge>} />
  </div>
);

// OrderDetailRow component
const OrderDetailRow: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);

// OrderHistoryTable component
const OrderHistoryTable: React.FC = () => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <OrderHistoryTableRow orderNumber="123456" orderDate="June 23, 2023" totalAmount={149.99} status="Fulfilled" />
      <OrderHistoryTableRow orderNumber="654321" orderDate="May 15, 2023" totalAmount={99.99} status="Declined" />
      <OrderHistoryTableRow orderNumber="789012" orderDate="April 30, 2023" totalAmount={79.99} status="Fulfilled" />
    </tbody>
  </table>
);

// OrderHistoryTableRow component
const OrderHistoryTableRow: React.FC<{ orderNumber: string; orderDate: string; totalAmount: number; status: string }> = ({ orderNumber, orderDate, totalAmount, status }) => (
  <tr className="bg-white">
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orderNumber}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orderDate}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${totalAmount}</td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Badge variant={status === "Fulfilled" ? "secondary" : "outline"}>{status}</Badge>
    </td>
  </tr>
);

// ContactDetail component
const ContactDetail: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);

// Badge component
const Badge: React.FC<{ variant: 'outline' | 'secondary'; children: React.ReactNode }> = ({ variant, children }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${variant === 'outline' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
    {children}
  </span>
);

export default Component;


// Import necessary modules and components
// import React, { useState, useEffect } from "react";
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore, doc, getDoc } from "firebase/firestore";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Button, ButtonProps } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// import Link from "next/link";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { ReactNode } from "react";
// import { db } from "@/firebase";

// interface CustomerProps {
//   name: string;
//   joinDate: string;
//   email: string;
//   phone: string;
//   address: string;
//   totalOrders: number;
//   totalSpent: number;
//   avgOrderValue: number;
//   lastLogin: string;
//   lastOrderDate: string;
//   lifetimeOrders: number;
// }
// interface Props {
//   customer: any;
//   onClose: () => void;
// }

// // Main component definition
// const Component: React.FC<Props> = ({ customer, onClose }) => {
//   // State to store customer data
//   const [customerData, setCustomerData] = useState<CustomerProps | null>(null);

//   // Effect hook to fetch customer data on component mount
//   useEffect(() => {
//     // Replace with logic to select a customer name and fetch data dynamically
//     const selectedCustomerName = "John Doe"; // Example selected customer name
//     fetchCustomerDetails(selectedCustomerName).then((data) => {
//       if (data) {
//         setCustomerData(data);
//       }
//     });
//   }, []);

//   // Function to fetch customer details from Firestore
//   async function fetchCustomerDetails(customerName: string): Promise<CustomerProps | null> {
//     // Example Firestore query
//     const customerRef = doc(db, "customers", customerName);
//     const docSnap = await getDoc(customerRef);
//     if (docSnap.exists()) {
//       return docSnap.data() as CustomerProps;
//     } else {
//       console.log("No such document!");
//       return null;
//     }
//   }

//   // Render JSX based on customerData state
//   return (
//     <div className="container mx-auto px-4 md:px-6 py-8">
//       {customerData ? (
//         <div className="grid md:grid-cols-[1fr_300px] gap-8">
//           <div className="grid gap-8">
//             <div className="grid gap-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <Avatar className="w-12 h-12">
//                     <AvatarImage src="/placeholder-user.jpg" />
//                     <AvatarFallback>{customerData.name.slice(0, 2)}</AvatarFallback>
//                   </Avatar>
//                   <div className="grid gap-1">
//                     <h1 className="text-2xl font-bold">{customerData.name}</h1>
//                     <p className="text-muted-foreground">Joined: {customerData.joinDate}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <ContactButton variant="outline" size="icon" icon={<PhoneIcon className="h-5 w-5" />} label="WhatsApp" />
//                   <ContactButton variant="outline" size="icon" icon={<PhoneIcon className="h-5 w-5" />} label="Call" />
//                   <ContactButton variant="outline" size="icon" icon={<MailIcon className="h-5 w-5" />} label="Message" />
//                 </div>
//               </div>
//               <Separator />
//               <div className="grid gap-4">
//                 <div className="grid gap-2">
//                   <h2 className="text-xl font-semibold">Last Order</h2>
//                   <OrderDetails orderNumber="123456" orderDate={customerData.lastOrderDate} totalAmount={149.99} status="Fulfilled" />
//                 </div>
//                 <Separator />
//                 <div className="grid gap-2">
//                   <h2 className="text-xl font-semibold">Order History</h2>
//                   <OrderHistoryTable />
//                 </div>
//               </div>
//             </div>
//             <div className="grid gap-4">
//               <h2 className="text-xl font-semibold">Contact Information</h2>
//               <div className="grid gap-2 text-sm">
//                 <ContactDetail label="Email" value={<Link href="#" className="text-blue-600 underline" prefetch={false}>{customerData.email}</Link>} />
//                 <ContactDetail label="Phone" value={<Link href="#" className="text-blue-600 underline" prefetch={false}>{customerData.phone}</Link>} />
//                 <ContactDetail label="Address" value={customerData.address} />
//               </div>
//             </div>
//           </div>
//           <div className="grid gap-4">
//             <CustomerLifetimeCard totalOrders={customerData.totalOrders} totalSpent={customerData.totalSpent} avgOrderValue={customerData.avgOrderValue} />
//             <CustomerInsightsCard lastLogin={customerData.lastLogin} lastOrderDate={customerData.lastOrderDate} lifetimeOrders={customerData.lifetimeOrders} />
//           </div>
//         </div>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// };

// // Contact button component definition
// interface ContactButtonProps extends ButtonProps {
//   icon: ReactNode;
//   label: string;
// }

// const ContactButton: React.FC<ContactButtonProps> = ({ icon, label, ...rest }) => (
//   <Button {...rest} className="h-8 w-8">
//     {icon}
//     <span className="sr-only">{label}</span>
//   </Button>
// );

// // Order details component definition
// interface OrderDetailsProps {
//   orderNumber: string;
//   orderDate: string;
//   totalAmount: number;
//   status: string;
// }

// const OrderDetails: React.FC<OrderDetailsProps> = ({ orderNumber, orderDate, totalAmount, status }) => (
//   <div className="grid gap-1 text-sm">
//     <OrderDetailRow label="Order #" value={orderNumber} />
//     <OrderDetailRow label="Date" value={orderDate} />
//     <OrderDetailRow label="Total" value={`$${totalAmount}`} />
//     <OrderDetailRow label="Status" value={<Badge variant={status === "Fulfilled" ? "secondary" : "outline"}>{status}</Badge>} />
//   </div>
// );

// // Order detail row component definition
// interface OrderDetailRowProps {
//   label: string;
//   value: string | React.ReactNode;
// }

// const OrderDetailRow: React.FC<OrderDetailRowProps> = ({ label, value }) => (
//   <div className="flex items-center justify-between">
//     <span className="text-muted-foreground">{label}</span>
//     <span>{value}</span>
//   </div>
// );

// // Separator component definition
// const Separator = () => <hr className="border-gray-300 my-4" />;

// // Order history table component definition
// const OrderHistoryTable: React.FC = () => (
//   <Table>
//     <TableHeader>
//       <TableRow>
//         <TableHead>Order #</TableHead>
//         <TableHead>Date</TableHead>
//         <TableHead>Total</TableHead>
//         <TableHead>Status</TableHead>
//       </TableRow>
//     </TableHeader>
//     <TableBody>
//       <OrderHistoryTableRow orderNumber="123456" orderDate="June 23, 2023" totalAmount={149.99} status="Fulfilled" />
//       <OrderHistoryTableRow orderNumber="654321" orderDate="May 15, 2023" totalAmount={99.99} status="Declined" />
//       <OrderHistoryTableRow orderNumber="789012" orderDate="April 30, 2023" totalAmount={79.99} status="Fulfilled" />
//     </TableBody>
//   </Table>
// );

// // Order history table row component definition
// interface OrderHistoryTableRowProps {
//   orderNumber: string;
//   orderDate: string;
//   totalAmount: number;
//   status: string;
// }

// const OrderHistoryTableRow: React.FC<OrderHistoryTableRowProps> = ({ orderNumber, orderDate, totalAmount, status }) => (
//   <TableRow>
//     <TableCell>{orderNumber}</TableCell>
//     <TableCell>{orderDate}</TableCell>
//     <TableCell>${totalAmount}</TableCell>
//     <TableCell>
//       <Badge variant={status === "Fulfilled" ? "secondary" : "outline"}>{status}</Badge>
//     </TableCell>
//   </TableRow>
// );

// // Contact detail component definition
// const ContactDetail: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
//   <div className="flex items-center justify-between">
//     <span className="text-muted-foreground">{label}</span>
//     <span>{value}</span>
//   </div>
// );

// // Customer lifetime card component definition
// interface CustomerLifetimeCardProps {
//   totalOrders: number;
//   totalSpent: number;
//   avgOrderValue: number;
// }

// const CustomerLifetimeCard: React.FC<CustomerLifetimeCardProps> = ({ totalOrders, totalSpent, avgOrderValue }) => (
//   <Card>
//     <CardHeader>
//       <CardTitle>Customer Lifetime Value</CardTitle>
//     </CardHeader>
//     <CardContent className="grid gap-2">
//       <CustomerStatRow label="Total Orders" value={totalOrders.toString()} />
//       <CustomerStatRow label="Total Spent" value={`$${totalSpent.toFixed(2)}`} />
//       <CustomerStatRow label="Average Order Value" value={`$${avgOrderValue.toFixed(2)}`} />
//     </CardContent>
//   </Card>
// );

// // Customer stat row component definition
// const CustomerStatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
//   <div className="flex items-center justify-between">
//     <span className="text-muted-foreground">{label}</span>
//     <span>{value}</span>
//   </div>
// );

// // Customer insights card component definition
// interface CustomerInsightsCardProps {
//   lastLogin: string;
//   lastOrderDate: string;
//   lifetimeOrders: number;
// }

// const CustomerInsightsCard: React.FC<CustomerInsightsCardProps> = ({ lastLogin, lastOrderDate, lifetimeOrders }) => (
//   <Card>
//     <CardHeader>
//       <CardTitle>Customer Insights</CardTitle>
//     </CardHeader>
//     <CardContent className="grid gap-2">
//       <CustomerInsightRow label="Last Login" value={lastLogin} />
//       <CustomerInsightRow label="Last Order" value={lastOrderDate} />
//       <CustomerInsightRow label="Lifetime Orders" value={lifetimeOrders.toString()} />
//     </CardContent>
//   </Card>
// );

// // Customer insight row component definition
// const CustomerInsightRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
//   <div className="flex items-center justify-between">
//     <span className="text-muted-foreground">{label}</span>
//     <span>{value}</span>
//   </div>
// );

// // SVG icon components
// function MailIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect width="20" height="16" x="2" y="4" rx="2" />
//       <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
//     </svg>
//   );
// }

// function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
//     </svg>
//   );
// }

// export default Component;
// /**
//  * v0 by Vercel.
//  * @see https://v0.dev/t/yLrcMrFMoLQ
//  * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
//  */
// Import necessary components and modules
// Import necessary components and modules
