import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import path as necessary

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface OrderItem {
  category: string;
  pricePerKg: string;
  weight: string;
}

interface Order {
  orderDate: string;
  orderItems: OrderItem[];
  totalPrice: number;
}

const MonthlyTotalProductChart: React.FC = () => {
  const [orderCountData, setOrderCountData] = useState<number[]>([]);
  const [totalAmountData, setTotalAmountData] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const fetchedOrders = querySnapshot.docs.map(doc => doc.data() as Order);

        const monthlyOrderCount: number[] = new Array(12).fill(0);
        const monthlyTotalAmount: number[] = new Array(12).fill(0);

        fetchedOrders.forEach(order => {
          const orderDate = new Date(order.orderDate);
          const monthIndex = orderDate.getMonth();

          monthlyOrderCount[monthIndex] += 1;
          monthlyTotalAmount[monthIndex] += order.totalPrice;
        });

        setOrderCountData(monthlyOrderCount);
        setTotalAmountData(monthlyTotalAmount);
      } catch (error) {
        setError("Error fetching orders.");
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
      {
        label: 'Order Count',
        data: orderCountData,
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Total Amount',
        data: totalAmountData,
        fill: false,
        backgroundColor: 'rgb(255, 159, 64)',
        borderColor: 'rgba(255, 159, 64, 0.2)',
      }
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const monthIndex = tooltipItems[0].dataIndex;
            return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][monthIndex];
          },
          label: (tooltipItem: any) => {
            const datasetLabel = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            const isOrderCount = datasetLabel === 'Order Count';
            return `${datasetLabel}: ${value} ${isOrderCount ? 'orders' : 'USD'}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        stepSize: 1
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default MonthlyTotalProductChart;
