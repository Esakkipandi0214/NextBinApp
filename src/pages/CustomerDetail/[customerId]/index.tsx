import React, { useState, useEffect, FormEvent } from 'react';
import Layout from '@/components/layout';
import Link from 'next/link';
import { db } from "../../../firebase"; // Assuming you've exported db from your Firebase initialization file
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { IoCallOutline } from "react-icons/io5";
import { BsChat } from "react-icons/bs";
import { MdOutlineEmail } from "react-icons/md";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';

interface CustomerProps {
  id: string;
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
  orders: OrderProps[];
}

interface OrderProps {
  customerId: string;
  orderDate: string;
  orderPayment: number;
  status: string;
  id: string;
  orderType?: string;
  orderTime?: number;
  orderWeight?: string;
}

type handleEditFunction = (props: OrderProps) => void;

const Component: React.FC = () => {
  const router = useRouter();
  const { customerId } = router.query; // Correctly get the customerId from the route query
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProps | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderProps | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (order: OrderProps) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingOrder || !editingOrder.id) {
      console.error('Editing order ID is undefined or null.');
      return;
    }

    const orderId = editingOrder.id;
    const orderPayment = (event.currentTarget.elements.namedItem("orderPayment") as HTMLInputElement).value;
    const status = (event.currentTarget.elements.namedItem("status") as HTMLInputElement).value;

    try {
      await updateDoc(doc(db, "orders", orderId), {
        orderPayment: orderPayment,
        status: status,
      });
      alert("Order updated successfully!");
      setShowEditModal(false);
      fetchCustomerData(); // Fetch the updated data
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const fetchCustomerData = async () => {
    if (!customerId || typeof customerId !== 'string') return; // Ensure customerId is valid
    const customerDocRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerDocRef);
    const customerData = customerDoc.data() as CustomerProps;

    if (customerData) {
      customerData.id = customerDoc.id;
      customerData.orders = [];

      const ordersCollection = collection(db, 'orders');
      const ordersQuery = query(ordersCollection, where('customerId', '==', customerId));
      const ordersSnapshot = await getDocs(ordersQuery);

      const ordersData = ordersSnapshot.docs.map(orderDoc => {
        const orderData = orderDoc.data() as OrderProps;
        orderData.id = orderDoc.id;
        return orderData;
      });

      customerData.orders = ordersData;

      if (ordersData.length > 0) {
        const lastOrder = ordersData.reduce((latest, order) => {
          const orderDate = new Date(order.orderDate);
          return orderDate > new Date(latest.orderDate) ? order : latest;
        }, ordersData[0]);
        customerData.lastOrderDate = lastOrder.orderDate;
      } else {
        customerData.lastOrderDate = '';
      }

      setSelectedCustomer(customerData);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]); // Add customerId as a dependency to refetch data when it changes

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        {selectedCustomer && (
          <div className="grid gap-8">
            <div className="flex items-center gap-4">
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
                  <OrderDetails order={selectedCustomer.orders[0]} />
                ) : (
                  <p>No orders found.</p>
                )}
              </div>
              <Separator />
              <div className="grid gap-2">
                <h2 className="text-xl font-semibold">Order Details</h2>
                <OrderDetailsTable orders={selectedCustomer.orders} />
              </div>
              <Separator />
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
          </div>
        )}
      </div>
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg p-6 w-1/2 max-w-sm">
            <h2 className="text-2xl font-bold mb-4">Edit Order Details</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orderPayment">Payment</Label>
                  <Input id="orderPayment" name="orderPayment" type="text" placeholder="Enter order payment" defaultValue={editingOrder?.orderPayment} required />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" name="status" type="text" placeholder="Enter order status" defaultValue={editingOrder?.status} required />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" onClick={() => setShowEditModal(false)} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

// OrderDetails component
const OrderDetails: React.FC<{ order: OrderProps }> = ({ order }) => {
  return (
    <div className="grid gap-2 text-sm">
      <p><span className="font-semibold">Order ID:</span> {order.id}</p>
      <p><span className="font-semibold">Date:</span> {order.orderDate}</p>
      <p><span className="font-semibold">Payment:</span> {order.orderPayment}</p>
      <p><span className="font-semibold">Status:</span> {order.status}</p>
      <p><span className="font-semibold">Type:</span> {order.orderType || 'N/A'}</p>
      <p><span className="font-semibold">Time:</span> {order.orderTime || 'N/A'}</p>
      <p><span className="font-semibold">Weight:</span> {order.orderWeight || 'N/A'}</p>
    </div>
  );
};

// OrderDetailsTable component
const OrderDetailsTable: React.FC<{ orders: OrderProps[] }> = ({ orders }) => {
  return (
    <table className="min-w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Order ID</th>
          <th className="border border-gray-300 px-4 py-2">Date</th>
          <th className="border border-gray-300 px-4 py-2">Payment</th>
          <th className="border border-gray-300 px-4 py-2">Status</th>
          <th className="border border-gray-300 px-4 py-2">Type</th>
          <th className="border border-gray-300 px-4 py-2">Time</th>
          <th className="border border-gray-300 px-4 py-2">Weight</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td className="border border-gray-300 px-4 py-2">{order.id}</td>
            <td className="border border-gray-300 px-4 py-2">{order.orderDate}</td>
            <td className="border border-gray-300 px-4 py-2">{order.orderPayment}</td>
            <td className="border border-gray-300 px-4 py-2">{order.status}</td>
            <td className="border border-gray-300 px-4 py-2">{order.orderType || 'N/A'}</td>
            <td className="border border-gray-300 px-4 py-2">{order.orderTime || 'N/A'}</td>
            <td className="border border-gray-300 px-4 py-2">{order.orderWeight || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// OrderHistoryTable component
const OrderHistoryTable: React.FC<{ orders: OrderProps[], handleEditClick: handleEditFunction }> = ({ orders, handleEditClick }) => {
  return (
    <table className="min-w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Order ID</th>
          <th className="border border-gray-300 px-4 py-2">Date</th>
          <th className="border border-gray-300 px-4 py-2">Payment</th>
          <th className="border border-gray-300 px-4 py-2">Status</th>
          <th className="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td className="border border-gray-300 px-4 py-2">{order.id}</td>
            <td className="border border-gray-300 px-4 py-2">{order.orderDate}</td>
            <td className="border border-gray-300 px-4 py-2">{order.orderPayment}</td>
            <td className="border border-gray-300 px-4 py-2">{order.status}</td>
            <td className="border border-gray-300 px-4 py-2">
              <button onClick={() => handleEditClick(order)} className="text-blue-600 hover:underline">Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ContactDetail component
const ContactDetail: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => {
  return (
    <div className="flex items-center gap-2">
      <p className="font-semibold">{label}:</p>
      <div>{value}</div>
    </div>
  );
};

export default Component;
