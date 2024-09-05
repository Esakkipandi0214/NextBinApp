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

const calculateAggregates = (items: OrderItem[]) => {
  const aggregates: { [key: string]: { [subCategory: string]: { totalWeight: number, totalPriceWeighted: number, count: number } } } = {};

  items.forEach(item => {
    if (!aggregates[item.category]) {
      aggregates[item.category] = {};
    }

    if (!aggregates[item.category][item.subCategory]) {
      aggregates[item.category][item.subCategory] = { totalWeight: 0, totalPriceWeighted: 0, count: 0 };
    }

    const weight = parseFloat(item.weight);
    aggregates[item.category][item.subCategory].totalWeight += weight;
    aggregates[item.category][item.subCategory].totalPriceWeighted += item.pricePerKg * weight;
    aggregates[item.category][item.subCategory].count += 1;
  });

  return Object.entries(aggregates).map(([category, subCategories]) => ({
    category,
    subCategories: Object.entries(subCategories).map(([subCategory, { totalWeight, totalPriceWeighted }]) => ({
      subCategory,
      totalWeight,
      avgPricePerKg: totalPriceWeighted / totalWeight || 0,
      totalPrice: totalWeight * (totalPriceWeighted / totalWeight || 0),
    })),
  }));
};

export default function OrdersHistory() {
  const [orders, setOrders] = useState<FormData[]>([]);
  const [aggregatedOrders, setAggregatedOrders] = useState<any[]>([]);
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
        setTotalSum(aggregates.reduce((sum, category) => sum + category.subCategories.reduce((subSum, sub) => subSum + sub.totalPrice, 0), 0));
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Order Items by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className=" grid w-full justify-end pr-2">
              <tr className=" bg-slate-500/30 border rounded-xl">
                <td className="px-4 py-2 text-right font-medium text-gray-700" colSpan={3}>Total Inventory Price:</td>
                <td className="px-4 py-2 text-left font-medium text-gray-900 ">AU$ {totalSum.toFixed(2)}</td>
              </tr>
            </div>
          </div>
          <div className="overflow-x-auto">
            {aggregatedOrders.length ? aggregatedOrders.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-6">
                <h2 className="text-xl font-semibold text-white bg-slate-500/65 p-2 border">{category.category}</h2>
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
                    {category.subCategories.map((subCategoryItem: { subCategory: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; totalWeight: number; avgPricePerKg: number; totalPrice: number; }, subCategoryIndex: React.Key | null | undefined) => (
                      <tr key={subCategoryIndex} className="border-b border-gray-200">
                        <td className="px-4 py-2 text-gray-900">{subCategoryItem.subCategory}</td>
                        <td className="px-4 py-2 text-gray-900">{subCategoryItem.totalWeight.toFixed(2)}</td>
                        <td className="px-4 py-2 text-gray-900">AU$ {subCategoryItem.avgPricePerKg.toFixed(2)}</td>
                        <td className="px-4 py-2 text-gray-900">AU$ {subCategoryItem.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr className="bg-blue-500/50">
                      <td className="px-4 py-2 text-right font-medium text-gray-700" colSpan={3}>Total {category.category} Price:</td>
                      <td className="px-4 py-2 text-left font-medium text-gray-900">
                      AU$ {category.subCategories.reduce((sum: any, sub: { totalPrice: any; }) => sum + sub.totalPrice, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )) : (
              <div className="text-center text-gray-500">No items available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
