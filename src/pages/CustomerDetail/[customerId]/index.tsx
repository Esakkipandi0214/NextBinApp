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
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

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
interface OrderItem {
  category: string;
  subCategory: string;
}
interface OrderProps {
  customerId: string;
  orderDate: string;
  orderPayment: number;
  status: string;
  id: string;
  orderItems: OrderItem[];
  category?: string;
  orderTime?: number;
  totalWeight?: string;
  subCategory?: string;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

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

      const ordersData = await Promise.all(ordersSnapshot.docs.map(async (orderDoc) => {
        const orderData = orderDoc.data() as OrderProps;
        orderData.id = orderDoc.id;

        // Fetch the subcategory detail
        if (orderData.category) {
          const subCategoryDocRef = doc(db, 'orders', orderData.category);
          const subCategoryDoc = await getDoc(subCategoryDocRef);
          if (subCategoryDoc.exists()) {
            orderData.subCategory = subCategoryDoc.data()?.name || 'N/A';
          } else {
            orderData.subCategory = 'N/A';
          }
        }

        return orderData;
      }));

      customerData.orders = ordersData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

      if (ordersData.length > 0) {
        customerData.lastOrderDate = ordersData[0].orderDate;
      } else {
        customerData.lastOrderDate = '';
      }

      setSelectedCustomer(customerData);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []); // Add customerId as a dependency to refetch data when it changes

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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
      {order.orderItems.map((item, index) => (
        <div key={index}>
          <p><span className="font-semibold">Category:</span> {item.category || 'N/A'}</p>
          <p><span className="font-semibold">SubCategory:</span> {item.subCategory || 'N/A'}</p>
        </div>
      ))}
      <p><span className="font-semibold">Time:</span> {order.orderTime || 'N/A'}</p>
      <p><span className="font-semibold">Weight:</span> {order.totalWeight || 'N/A'}</p>
    </div>
  );
};

// OrderDetailsTable component
const OrderDetailsTable: React.FC<{ orders: OrderProps[] }> = ({ orders }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Payment</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Categories</th>
            <th className="border border-gray-300 px-4 py-2 text-left">SubCategories</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Weight</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order,index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{index+1}</td>
              <td className="border border-gray-300 px-4 py-2">{order.orderDate}</td>
              <td className="border border-gray-300 px-4 py-2">{order.orderPayment}</td>
              <td className="border border-gray-300 px-4 py-2">{order.status}</td>
              <td className="border border-gray-300 px-4 py-2">
                {order.orderItems.map((item, index) => (
                  <p key={index}>{item.category || 'N/A'}</p>
                ))}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {order.orderItems.map((item, index) => (
                  <p key={index}>{item.subCategory || 'N/A'}</p>
                ))}
              </td>
              <td className="border border-gray-300 px-4 py-2">{order.orderTime || 'N/A'}</td>
              <td className="border border-gray-300 px-4 py-2">{order.totalWeight || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// OrderHistoryTable component
const OrderHistoryTable: React.FC<{ orders: OrderProps[], handleEditClick: handleEditFunction }> = ({ orders, handleEditClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Payment</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order,index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">{index+1}</td>
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
    </div>
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