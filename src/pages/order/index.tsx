import { useState, useEffect, ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Layout from "@/components/layout";

interface Customer {
  id: string;
  name: string;
}

interface FormData {
 
  customerId: string;
  customerName: string;
  orderType: string;
  orderDate: string;
  orderTime: string;
  orderWeight: string;
  orderPayment: string;
  status: string;
}

export default function Component() {
  const [customerNames, setCustomerNames] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<FormData>({
  
    customerId: "",
    customerName: "",
    orderType: "",
    orderDate: "",
    orderTime: "",
    orderWeight: "",
    orderPayment: "",
    status: "",
  });

  useEffect(() => {
    const fetchCustomerNames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customers"));
        const customers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        })) as Customer[];
        setCustomerNames(customers);
      } catch (error) {
        console.error("Error fetching customer names: ", error);
      }
    };

    fetchCustomerNames();
  }, []);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const formattedTime = currentDate.toTimeString().split(' ')[0];
  
    const updatedFormData = {
      ...formData,
      orderDate: formattedDate,
      orderTime: formattedTime,
    };
  
    try {
      const docRef = await addDoc(collection(db, "orders"), updatedFormData);
      console.log("Document written with ID: ", docRef.id);
  
      setFormData({
      
        customerId: "",
        customerName: "",
        orderType: "",
        orderDate: "",
        orderTime: "",
        orderWeight: "",
        orderPayment: "",
        status: "",
      });
  
      // Optionally, show a success message or redirect to another page
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleSelectChange = (value: string) => {
    const selectedCustomer = customerNames.find(customer => customer.name === value);
    if (selectedCustomer) {
      setFormData(prevState => ({
        ...prevState,
        customerId: selectedCustomer.id,
        customerName: value,
      }));
    }
  };

  const handleOrderTypeChange = (value: string) => {
    setFormData(prevState => ({
      ...prevState,
      orderType: value,
    }));
  };

  const handleOrderStatusChange = (value: string) => {
    setFormData(prevState => ({
      ...prevState,
      status: value,
    }));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  return (
    <Layout>
      <form onSubmit={handleFormSubmit}>
        <Card className="w-full max-md h-auto">
          <CardHeader>
            <CardTitle>Place Your Order</CardTitle>
            <CardDescription>Fill out the form to submit your order.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Select onValueChange={handleSelectChange} value={formData.customerName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer name" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerNames.map((customer, index) => (
                      <SelectItem key={index} value={customer.name}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderType">Order Type</Label>
                <Select onValueChange={handleOrderTypeChange} value={formData.orderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluminium">Aluminium</SelectItem>
                    <SelectItem value="Iron">Iron</SelectItem>
                    <SelectItem value="Plastic">Plastic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderWeight">Order Weight</Label>
                <Input id="orderWeight" type="number" placeholder="Enter order weight" onChange={handleInputChange} value={formData.orderWeight} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderPayment">Order Payment</Label>
                <Input id="orderPayment" type="number" placeholder="Enter order payment" onChange={handleInputChange} value={formData.orderPayment} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderStatus">Order Status</Label>
                <Select onValueChange={handleOrderStatusChange} value={formData.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Submit Order
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Layout>
  );
}