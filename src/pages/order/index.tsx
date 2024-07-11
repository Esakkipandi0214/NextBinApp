import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { db } from "../../firebase"; // Assuming you've exported db from your Firebase initialization file
import { collection, getDocs } from "firebase/firestore"; // Importing necessary Firestore functions
import Layout from "@/components/layout";

export default function Component() {
  const [customerNames, setCustomerNames] = useState<string[]>([]); // Specify the type of customerNames as an array of strings

  useEffect(() => {
    // Function to fetch customer names from Firebase
    const fetchCustomerNames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customers")); // Use getDocs with collection function
        const names = querySnapshot.docs.map(doc => doc.data().name);
        setCustomerNames(names);
      } catch (error) {
        console.error("Error fetching customer names: ", error);
      }
    };

    fetchCustomerNames();
  }, []);

  return (
    <Layout>
    <Card className="w-full max-md  h-auto">
      <CardHeader>
        <CardTitle>Place Your Order</CardTitle>
        <CardDescription>Fill out the form to submit your order.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select customer name" />
              </SelectTrigger>
              <SelectContent>
                {customerNames.map((name, index) => (
                  <SelectItem key={index} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-type">Order Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Aluminium</SelectItem>
                <SelectItem value="subscription">Iron</SelectItem>
                <SelectItem value="refund">Plastic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="order-date">Order Date</Label>
            <Input id="order-date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-time">Order Time</Label>
            <Input id="order-time" type="time" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-weight">Order Weight</Label>
          <Input id="order-weight" type="number" placeholder="Enter order weight" />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full">
          Submit Order
        </Button>
      </CardFooter>
    </Card>
    </Layout>
  );
}
