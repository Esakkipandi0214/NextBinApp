import React, { useState, useEffect } from "react";
import Layout from '@/components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

interface OrderItem {
  category: string;
  subCategory: string;
  weight: string;
  pricePerKg: number;
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

const calculateAggregates = (items: OrderItem[]) => {
  const aggregates: { [key: string]: { totalWeight: number, totalPriceWeighted: number, count: number } } = {};

  items.forEach(item => {
    const key = `${item.category}-${item.subCategory}`;

    if (!aggregates[key]) {
      aggregates[key] = { totalWeight: 0, totalPriceWeighted: 0, count: 0 };
    }

    const weight = parseFloat(item.weight);
    
    aggregates[key].totalWeight += weight;
    aggregates[key].totalPriceWeighted += item.pricePerKg * weight;
    aggregates[key].count += 1;
  });

  return Object.entries(aggregates).map(([key, { totalWeight, totalPriceWeighted, count }]) => {
    const [category, subCategory] = key.split("-");
    
    const avgPricePerKg = totalWeight ? totalPriceWeighted / totalWeight : 0;
    const totalPrice = totalWeight * avgPricePerKg;

    return {
      category,
      subCategory,
      totalWeight,
      avgPricePerKg,
      totalPrice, // Add total price calculation here
    };
  });
};

export default function OrdersHistory() {
  const [orders, setOrders] = useState<FormData[]>([]);
  const [aggregatedOrders, setAggregatedOrders] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>("");
  const [totalSum, setTotalSum] = useState<number>(0); // State for total sum of all total prices
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersData = querySnapshot.docs.map((doc) => ({
          orderId: doc.id,
          ...(doc.data() as FormData),
        }));

        setOrders(ordersData);
        const allItems = ordersData.flatMap(order => order.orderItems);
        const aggregates = calculateAggregates(allItems);
        setAggregatedOrders(aggregates);
        setTotalSum(aggregates.reduce((sum, item) => sum + item.totalPrice, 0)); // Calculate total sum of all total prices
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const filterAggregatedOrders = () => {
      let results = aggregatedOrders;

      if (categoryFilter) {
        results = results.filter(item =>
          item.category.toLowerCase().includes(categoryFilter.toLowerCase())
        );
      }

      if (subCategoryFilter) {
        results = results.filter(item =>
          item.subCategory.toLowerCase().includes(subCategoryFilter.toLowerCase())
        );
      }

      setAggregatedOrders(results);
    };

    filterAggregatedOrders();
  }, [categoryFilter, subCategoryFilter, aggregatedOrders]);

  const handleApplyFilters = () => {
    const filterAggregatedOrders = () => {
      let results = aggregatedOrders;

      if (categoryFilter) {
        results = results.filter(item =>
          item.category.toLowerCase().includes(categoryFilter.toLowerCase())
        );
      }

      if (subCategoryFilter) {
        results = results.filter(item =>
          item.subCategory.toLowerCase().includes(subCategoryFilter.toLowerCase())
        );
      }

      setAggregatedOrders(results);
    };

    filterAggregatedOrders();
  };

  const handleResetFilters = () => {
    setCategoryFilter("");
    setSubCategoryFilter("");
    const allItems = orders.flatMap(order => order.orderItems);
    const aggregates = calculateAggregates(allItems);
    setAggregatedOrders(aggregates);
    setTotalSum(aggregates.reduce((sum, item) => sum + item.totalPrice, 0)); // Recalculate total sum after resetting filters
  };

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="mb-4 flex flex-col md:flex-row md:space-x-4">
              <input
                type="text"
                placeholder="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border p-2 rounded mb-2 md:mb-0 flex-1"
              />
              <input
                type="text"
                placeholder="Filter by subcategory"
                value={subCategoryFilter}
                onChange={(e) => setSubCategoryFilter(e.target.value)}
                className="border p-2 rounded mb-2 md:mb-0 flex-1"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleApplyFilters}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Apply
              </button>
              <button
                onClick={handleResetFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
            <div className=" grid w-full justify-end pr-2">
                <tr className=" bg-slate-500/30  border rounded-xl ">
                  <td className="px-4 py-2 text-right font-medium  text-gray-700" colSpan={3}>Total Inventry Price:</td>
                  <td className="px-4 py-2 text-left font-medium text-gray-900 ">${totalSum.toFixed(2)}</td>
                </tr>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Goods</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Total Weight</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Average Price per Kg</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Total Price</th> {/* New header */}
                </tr>
              </thead>
              <tbody className="bg-white">
                {aggregatedOrders.length ? aggregatedOrders.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-2 text-gray-900">{item.subCategory}</td>
                    <td className="px-4 py-2 text-gray-900">{item.totalWeight.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-900">${item.avgPricePerKg.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-900">${item.totalPrice.toFixed(2)}</td> {/* Display total price */}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-gray-500">No items available</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr className=" bg-blue-500/50 ">
                  <td className="px-4 py-2 text-right font-medium  text-gray-700" colSpan={3}>Total:</td>
                  <td className="px-4 py-2 text-left font-medium text-gray-900 ">${totalSum.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
