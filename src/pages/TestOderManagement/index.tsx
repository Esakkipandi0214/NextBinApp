import React, { useState, useEffect } from "react";
import Layout from '@/components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

interface OrderItem {
  category: string;
  subCategory: string;
  weight: string;
  pricePerKg: number; // Ensure this is a number
}

interface FormData {
  customerName: string;
  orderPayment: string;
  status: string;
  orderItems: OrderItem[];
  orderId?: string;
  totalPrice: number;
  orderDate?: string;
  orderTime?: string;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString();

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const OrderDetailModal = ({ order, onClose }: { order: FormData | null; onClose: () => void; }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-3xl font-semibold mb-6 border-b pb-3 text-gray-800">Order Details</h2>
        <div className="mb-6 space-y-2">
          <p><strong className="font-medium text-gray-700">Customer Name:</strong> <span className="text-gray-900">{order.customerName}</span></p>
          <p><strong className="font-medium text-gray-700">Status:</strong> <span className="text-gray-900">{order.status}</span></p>
          <p><strong className="font-medium text-gray-700">Total Price:</strong> <span className="text-gray-900">${order.totalPrice.toFixed(2)}</span></p>
          <p><strong className="font-medium text-gray-700">Date:</strong> <span className="text-gray-900">{order.orderDate ? formatDate(order.orderDate) : "N/A"}</span></p>
          <p><strong className="font-medium text-gray-700">Time:</strong> <span className="text-gray-900">{order.orderTime || "N/A"}</span></p>
        </div>
        <h3 className="text-2xl font-semibold mt-6 mb-4 border-t pt-4 text-gray-800">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Subcategory</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Weight</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Price per Kg</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {order.orderItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-2 text-gray-900">{item.category}</td>
                  <td className="px-4 py-2 text-gray-900">{item.subCategory}</td>
                  <td className="px-4 py-2 text-gray-900">{item.weight}</td>
                  <td className="px-4 py-2 text-gray-900">${Number(item.pricePerKg).toFixed(2)}</td>
                </tr>
              ))}
              {order.orderItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center text-gray-500">No items available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary" className="bg-gray-500 text-white hover:bg-gray-600">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function OrdersHistory() {
  const [orders, setOrders] = useState<FormData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<FormData[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [filterMonth, setFilterMonth] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [filterWeek, setFilterWeek] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FormData | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersData = querySnapshot.docs.map((doc) => ({
          orderId: doc.id,
          ...doc.data(),
        })) as FormData[];

        // Sort orders by date if necessary
        ordersData.sort((a, b) => {
          const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
          const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
          return dateB - dateA;
        });

        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const filterOrders = () => {
      let results = orders;

      if (customerName) {
        results = results.filter((order) =>
          order.customerName.toLowerCase().includes(customerName.toLowerCase())
        );
      }

      if (filterMonth && filterYear) {
        const monthIndex = monthNames.indexOf(filterMonth);
        results = results.filter((order) => {
          const orderDate = new Date(order.orderDate || "");
          return (
            orderDate.getFullYear() === parseInt(filterYear) &&
            orderDate.getMonth() === monthIndex
          );
        });
      }

      if (filterDate) {
        results = results.filter((order) => {
          const orderDate = new Date(order.orderDate || "").toISOString().split("T")[0];
          return orderDate === filterDate;
        });
      }

      if (filterWeek) {
        const weekStart = new Date(filterWeek);
        const weekEnd = new Date(filterWeek);
        weekEnd.setDate(weekEnd.getDate() + 6);

        results = results.filter((order) => {
          const orderDate = new Date(order.orderDate || "");
          return orderDate >= weekStart && orderDate <= weekEnd;
        });
      }

      setFilteredOrders(results);
    };

    filterOrders();
  }, [customerName, filterMonth, filterYear, filterDate, filterWeek, orders]);

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, "orders", orderId));
      console.log("Document successfully deleted");

      setOrders((prevOrders) => prevOrders.filter((o) => o.orderId !== orderId));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex space-x-4">
            <input
              type="text"
              placeholder="Filter by customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={filterMonth || ""}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Month</option>
              {monthNames.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={filterYear || ""}
              onChange={(e) => setFilterYear(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select Year</option>
              {Array.from(new Array(10), (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Filter by date"
              value={filterDate || ""}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="week"
              placeholder="Filter by week"
              value={filterWeek || ""}
              onChange={(e) => setFilterWeek(e.target.value)}
              className="border p-2 rounded"
            />
            <Button onClick={() => {
              setCustomerName("");
              setFilterMonth(null);
              setFilterYear(null);
              setFilterDate(null);
              setFilterWeek(null);
            }} variant="outline">Clear Filters</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Customer Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Payment</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Total Price</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Time</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-gray-900">{order.customerName}</td>
                    <td className="px-4 py-2 text-gray-900">{order.orderPayment}</td>
                    <td className="px-4 py-2 text-gray-900">{order.status}</td>
                    <td className="px-4 py-2 text-gray-900">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-900">{order.orderDate ? formatDate(order.orderDate) : "N/A"}</td>
                    <td className="px-4 py-2 text-gray-900">{order.orderTime || "N/A"}</td>
                    <td className="px-4 py-2 text-gray-900">
                      <div className="flex space-x-2">
                        <Button onClick={() => deleteOrder(order.orderId!)} variant="destructive">Delete</Button>
                        <Button onClick={() => setSelectedOrder(order)} variant="default">Details</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-2 text-center text-gray-500">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setFilteredOrders(orders)}>Reset Filters</Button>
        </CardFooter>
      </Card>
      <OrderDetailModal order={selectedOrder} onClose={handleCloseModal} />
    </Layout>
  );
}
