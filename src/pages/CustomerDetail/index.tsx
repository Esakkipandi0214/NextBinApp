import React, { useState, useEffect, FormEvent } from 'react';
import Layout from '@/components/layout';
import Link from 'next/link';
import { db } from "../../firebase"; // Assuming you've exported db from your Firebase initialization file
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore"; 
import { IoCallOutline } from "react-icons/io5";
import { BsChat } from "react-icons/bs";
import { MdOutlineEmail } from "react-icons/md";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  orders: OrderProps[]; // Add field for orders
}

interface OrderProps {
  orderType: string;
  orderDate: string;
  orderTime: number;
  orderWeight: string;
  
}
interface OrderProps {
  customerId: string;
  orderDate: string;
  orderPayment: number;
  status: string;
  
}
type handleEditFunction = (props:OrderProps ) =>void
interface OrderHistoryComponentProps {
  order : OrderProps;
  handleEdit : handleEditFunction
}

// Main component
const Component: React.FC = () => {
  // State for customers, selected customer, search query, and filtered customers
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProps | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerProps[]>([]);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);


 const  handleEditClick = (order: any) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };
  
  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const orderId = editingOrder.id;
    await updateDoc(doc(db, "order", orderId), {
      orderPayment: (event.currentTarget.elements.namedItem("orderPayment") as HTMLInputElement).value,
      status: (event.currentTarget.elements.namedItem("status") as HTMLInputElement).value,
    });
    alert("Order updated successfully!");
    setShowEditModal(false);
    fetchData(); // Ensure fetchData is defined and implemented
  };
  
  // Fetch customers and their orders from Firebase Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      const customersCollection = collection(db, 'customers'); // Replace 'customers' with your collection name
      const querySnapshot = await getDocs(customersCollection);
      
      const customerDataPromises = querySnapshot.docs.map(async doc => {
        const data = doc.data() as CustomerProps;
        const customerId = doc.id; // Assuming customer ID is the document ID
        data.orders = []; // Initialize orders array

        // Fetch orders for this customer
        const ordersCollection = collection(db, 'orders');
        const ordersQuery = query(ordersCollection, where('customerId', '==', customerId));
        const ordersSnapshot = await getDocs(ordersQuery);

        const ordersData = ordersSnapshot.docs.map(orderDoc => {
          const orderData = orderDoc.data() as OrderProps;
          return orderData;
        });

        // Add orders data to the customer
        data.orders = ordersData;

        // Calculate last order date if there are orders
        if (ordersData.length > 0) {
          const lastOrder = ordersData.reduce((latest, order) => {
            const orderDate = new Date(order.orderDate);
            return orderDate > new Date(latest.orderDate) ? order : latest;
          });
          data.lastOrderDate = lastOrder.orderDate;
        } else {
          data.lastOrderDate = '';
        }

        return data;
      });

      const customerData = await Promise.all(customerDataPromises);
      setCustomers(customerData);
      console.log("Customer Data:",customerData);
    };

    fetchCustomers();
  }, []);

  // Function to handle customer selection
  const handleCustomerSelect = async (customer: CustomerProps) => {
    setSelectedCustomer(customer);
    setSearchQuery(''); // Clear search query after selection if desired
    setFilteredCustomers([]); // Clear filtered customers list after selection if desired

    // Fetch orders for selected customer
    const ordersCollection = collection(db, 'orders'); // Replace 'orders' with your collection name
    const q = query(ordersCollection, where('customerName', '==', customer.name));
    const querySnapshot = await getDocs(q);
    const orderData = querySnapshot.docs.map(doc => doc.data() as OrderProps);
    setSelectedCustomer(prevCustomer => ({
      ...prevCustomer!,
      orders: orderData
    }));
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

  // const calculateDaysSinceLastOrder = (lastOrderDate: string): number => {
  //   if (!lastOrderDate) {
  //     console.log("not passed");
  //     return NaN; // Return NaN if lastOrderDate is not provided
  //   }
  //   const lastOrder = new Date(lastOrderDate);
  //   if (isNaN(lastOrder.getTime())) {
  //     console.log("not nan ");
  //     return NaN; // Return NaN if the date is invalid
  //   }
  //   const currentDate = new Date();
  //   const differenceInTime = currentDate.getTime() - lastOrder.getTime();
  //   const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  //   return differenceInDays;
  // };
  
  
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
                <CustomerList customers={customers} onCustomerSelect={handleCustomerSelect}  />
              )}
              {searchQuery.length > 0 && (
                <CustomerList customers={filteredCustomers} onCustomerSelect={handleCustomerSelect}  />
              )}
            </div>
          </div>
          <div className="grid gap-4">
            {selectedCustomer && (
              <>
                <div className="flex items-center gap-4">
                  {/* <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    <Image src="/boy (1).png" alt="Profile" className="object-cover w-full h-full" />
                  </div> */}
                  <div className="grid gap-1">
                    <h1 className="text-2xl font-bold">{selectedCustomer.name}</h1>
                    <p className="text-muted-foreground">Joined: {selectedCustomer.joinDate}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <h2 className="text-xl font-semibold">Last Order</h2>
                    {selectedCustomer.orders.length > 0 ? (
                      <OrderDetails orderNumber={selectedCustomer.orders[0].orderType} orderDate={selectedCustomer.orders[0].orderDate} orderPayment={selectedCustomer.orders[0].orderPayment} status={selectedCustomer.orders[0].status} />
                    ) : (
                      <p>No orders found.</p>
                    )}
                  </div>
                  <Separator />
                  <div className="grid gap-2">
                    <h2 className="text-xl font-semibold">Order Details</h2>
                    <OrderDetailsTable orders={selectedCustomer.orders} />
                  </div>
                 
                  <div className="grid gap-2">
                    <h2 className="text-xl font-semibold">Order History</h2>
                    <OrderHistoryTable orders={selectedCustomer.orders} handleEditClick={handleEditClick} />
                  </div>
                </div>
                <div className="grid gap-4">
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                  <div className="grid gap-2 text-sm">
                    <ContactDetail label="Email" value={<Link href="#" className="text-blue-600 underline" prefetch={false}>{selectedCustomer.email}</Link>} />
                    <ContactDetail label="Phone" value={<Link href="#" className="text-blue-600 underline" prefetch={false}>{selectedCustomer.phone}</Link>} />
                    <ContactDetail label="Address" value={selectedCustomer.address} />
                    <div className='flex gap-2'>
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
      {showEditModal && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4">
    <div className="bg-white rounded-lg p-6 w-1/2 max-w-sm">
      <h2 className="text-2xl font-bold mb-4">Edit OrderDetails</h2>
      <form onSubmit={handleEditSubmit}>
        <div className="space-y-4">
          <div className="">
            <div>
              <Label htmlFor="orderPayment">Payment</Label>
              <Input id="orderPayment" name="orderPayment" type="text" placeholder="Enter orderPayment" defaultValue={editingOrder.orderPayment} required />
            </div>
          
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" name="status" type="text" placeholder="Enter status" defaultValue={editingOrder.status} required />
            </div>
          </div>
          
          <Button type="submit" className="w-3/4 ml-8">Save Changes</Button>
        </div>
      </form>
      <Button onClick={() => setShowEditModal(false)} className="mt-4 w-3/4 ml-8">Cancel</Button>
    </div>
  </div>
)}
    </Layout>
  );
};

// Assuming CustomerProps and the function calculateDaysSinceLastOrder are already defined

// CustomerList component to display list of customers
const CustomerList: React.FC<{
  customers: CustomerProps[];
  onCustomerSelect: (customer: CustomerProps) => void;
}> = ({ customers, onCustomerSelect }) => {
  // Function to calculate days since last order
  const calculateDaysSinceLastOrder = (lastOrderDate: string): number => {
    if (!lastOrderDate) {
      console.log("Last order date not passed");
      return NaN; // Return NaN if lastOrderDate is not provided
    }
    const lastOrder = new Date(lastOrderDate);
    if (isNaN(lastOrder.getTime())) {
      console.log("Invalid last order date");
      return NaN; // Return NaN if the date is invalid
    }
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - lastOrder.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };

  return (
    <div className="grid gap-4">
      {customers.map((customer, index) => {
        const daysSinceLastOrder = calculateDaysSinceLastOrder(customer.lastOrderDate);
        console.log("LastOrderdDate:", customer);
        let highlightClass = '';

        // Determine highlight class based on frequency days
        if (!isNaN(daysSinceLastOrder)) {
          if (daysSinceLastOrder >= 10) {
            highlightClass = 'bg-red-100'; // Red background for 10 days or more
          } else if (daysSinceLastOrder >= 5) {
            highlightClass = 'bg-yellow-100'; // Yellow background for 5-9 days
          }
        }

        return (
          <div
            key={index}
            className={`cursor-pointer border border-gray-200 p-2 rounded-md w-1/2 ${highlightClass}`}
            onClick={() => onCustomerSelect(customer)}
          >
            <h3 className="text-lg font-medium">{customer.name}</h3>
            <p className="text-sm text-gray-500">
              Last order: {!isNaN(daysSinceLastOrder) ? daysSinceLastOrder.toString() : "Not available"} days ago
            </p>
          </div>
        );
      })}
    </div>
  );
};



// Separator component
const Separator = () => <hr className="border-gray-300 my-4" />;

// OrderDetails component
const OrderDetails: React.FC<{ orderNumber: string; orderDate: string; orderPayment: number; status: string }> = ({ orderNumber, orderDate, orderPayment, status }) => (
  <div className="grid gap-1 text-sm">
    <OrderDetailRow label="Order #" value={orderNumber} />
    <OrderDetailRow label="Date" value={orderDate} />
    <OrderDetailRow label="Payment" value={`$${orderPayment}`} />
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
//orderDetail tabel
const OrderDetailsTable: React.FC<{ orders: OrderProps[] }> = ({ orders }) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {orders.map((order, index) => (
        <tr key={index} className="bg-white">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderType}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderDate}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderTime}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderWeight}</td>
          {/* <td className="px-6 py-4 whitespace-nowrap">
            <Badge variant={order.status === "Fulfilled" ? "secondary" : "outline"}>{order.status}</Badge>
          </td> */}
        </tr>
      ))}
    </tbody>
  </table>
);
// OrderHistoryTable component
const OrderHistoryTable: React.FC<{ orders: OrderProps[] , handleEditClick:handleEditFunction }> = ({ orders  , handleEditClick}) => {
  return(
    <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Id</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {orders.map((order, index) => (
        <tr key={index} className="bg-white">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerId}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderDate}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.orderPayment}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status}</td>
          <td className="px-6 py-4 whitespace-nowrap">
                      <Button onClick={() => handleEditClick(order)} variant="outline">Edit</Button>
                      {/* <Button className="ml-2" onClick={() => handleDeleteClick(customer.id)} variant="destructive">Delete</Button> */}
                    </td>
          {/* <td className="px-6 py-4 whitespace-nowrap">
            <Badge variant={order.status === "Fulfilled" ? "secondary" : "outline"}>{order.status}</Badge>
          </td> */}
        </tr>
      ))}
    </tbody>
  </table>
  )
};

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




function fetchData() {
  throw new Error('Function not implemented.');
}
