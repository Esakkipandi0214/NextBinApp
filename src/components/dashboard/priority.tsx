// components/PriorityProducts.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { collection, getDocs } from 'firebase/firestore'; // Adjust the import path as necessary
import { db } from "../../firebase"; // Ensure this path is correct based on your project structure

interface HighPriorityProduct {
  id: string;
  name: string;
  daysSinceLastOrder: number;
  email: string;
  phone: string;
  lastOrderDate: string;
  priorityClass: string;
}

const PriorityProducts: React.FC = () => {
  const [products, setProducts] = useState<HighPriorityProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriorityProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customerPriority"));
        const fetchedProducts: HighPriorityProduct[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<HighPriorityProduct, 'id'>)
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        setError("Error fetching priority products.");
        console.error("Error fetching priority products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorityProducts();
  }, []);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  // Function to determine background color based on priorityClass
  const getPriorityBackgroundColor = (priorityClass: string) => {
    switch (priorityClass) {
      case "bg-red-100":
        return "bg-red-500 text-red-50";
      case "bg-yellow-100":
        return "bg-yellow-500 text-yellow-50";
      case "bg-green-100":
        return "bg-green-500 text-green-50";
      default:
        return "bg-gray-500 text-gray-50"; // Default color if priorityClass does not match
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2 p-4 bg-white">
      <CardHeader>
        <CardTitle className="text-black">Customer Priority</CardTitle>
        <CardDescription className="text-black">A section highlighting high priority customers with additional details.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-4">
          {products.map((product) => (
            <li
              key={product.id}
              className={`flex flex-col md:flex-row items-start justify-between px-4 py-3 rounded-md ${getPriorityBackgroundColor(product.priorityClass)}`}
            >
              <div className="flex-1 mb-2 md:mb-0">
                <div className="font-medium text-lg">{product.name}</div>
                <div className="text-sm text-gray-200">Phone: {product.phone}</div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-sm text-gray-300">Last Order: {new Date(product.lastOrderDate).toLocaleDateString()}</div>
                <div className="text-sm text-gray-300">Days Since Last Order: {product.daysSinceLastOrder}</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PriorityProducts;
