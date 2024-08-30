//orders page 

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { db } from "../../firebase";
import { collection, query, where, orderBy, limit, getDocs, updateDoc, doc,deleteDoc,addDoc } from "firebase/firestore";
import Layout from '@/components/layout';
import CustomerNoteOders from "../../components/ui/CustomerNoteOrder";
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

interface Customer {
  id: string;
  name: string;
  number: string;
  email: string;
  license: string;
  registration: string;
  company: string;
}

interface CustomerWithMatchType extends Customer {
  matchType?: string; // Optional property
}


interface OrderItem {
  category: string;
  subCategory: string;
  weight: string;
  pricePerKg: number;
}

interface FormData {
  phone: string | number | readonly string[] | undefined;
  customerId: string;
  customerName: string;
  orderPayment: string;
  status: string;
  orderItems: OrderItem[];
  orderId?: string;
  totalWeight:number;
  totalPrice: number;
}

export default function Component() {
  const [customerNames, setCustomerNames] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState(customerNames);
  const [orderCategories, setOrderCategories] = useState<{ id: string; mainCategory: string; subCategory: string[] }[]>([]);
  const [formData, setFormData] = useState<FormData>({
    customerId: "",
    customerName: "",
    orderPayment: "",
    status: "",
    orderItems: [{ category: "", subCategory: "", weight: "", pricePerKg: 0 }],
    totalWeight:0,
    totalPrice: 0,
    phone:''
  });

  const [totalWeight, setTotalWeight] = useState(0);
  const router = useRouter();

  // const DropDown = [
  //   { orderType: "Aluminum", SubCategory: ["Aluminum Cast", "Aluminum Domestic","Aluminum Extrusion", "Aluminum Cables","Aluminum Engine Irony", "Aluminum Wheels","Aluminum rad clean", "Aluminum rad irony"] },
  //   { orderType: "Batteries", SubCategory: ["Batteries clean", "Batteries irony"] },
  //   { orderType: "Copper", SubCategory: ["Copper Bright and Shiny", "Copper Domestic","Copper 1", "Copper 2","Copper PVC 23%", "Copper PVC43%","Copper PVC high grade", "Copper Brass rad clean","Copper Brass rad irony"] },
  //   { orderType: "Compressor", SubCategory: ["Electric motors", "Electric Mot Starter motors","Lead wheel weights","Lead Sheets"] },
  //   { orderType: "Stainless", SubCategory: ["Stainless steel clean", "Stainless  steel","Steel HMS","Steel Pressings"] },
  // ];
  const DropDown=orderCategories;
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<FormData[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Fetch Customer Names
  useEffect(() => {
    const fetchCustomerNames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customers"));
        const customers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          number: doc.data().phone,
          email: doc.data().email,
          license: doc.data().license,
          registration: doc.data().registration,
          company: doc.data().Company,
        })) as Customer[];
        setCustomerNames(customers);
      } catch (error) {
        console.error("Error fetching customer names: ", error);
      }
    };

    fetchCustomerNames();
  }, []);
  
  // to restrict index page route
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchOrderCategories = async () => {
      try {
        const q = query(collection(db, "OrderCategory"));
        const querySnapshot = await getDocs(q);
        const categories: { id: string; mainCategory: string; subCategory: string[] }[] = [];
        querySnapshot.forEach((doc) => {
          categories.push({
            id: doc.id,
            mainCategory: doc.data().mainCategory,
            subCategory: doc.data().subCategory || []
          });
        });
        setOrderCategories(categories);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchOrderCategories();
  }, []);

  useEffect(() => {
    const calculateTotalWeight = () => {
      const totalWeight = formData.orderItems.reduce((total, item) => {
        const weight = parseFloat(item.weight);
        return !isNaN(weight) ? total + weight : total;
      }, 0);

      setTotalWeight(totalWeight);
    };

    calculateTotalWeight();
  }, [formData.orderItems]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validOrderItems = formData.orderItems.filter(
      (item) =>
        item.category !== "" && item.subCategory !== "" && item.weight !== ""
    );

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toTimeString().split(" ")[0];

    const updatedFormData = {
      ...formData,
      orderDate: formattedDate,
      orderTime: formattedTime,
      orderItems: validOrderItems,
    };

    try {
      if (updatedFormData.orderId) {
        const orderDocRef = doc(db, "orders", updatedFormData.orderId);
        await updateDoc(orderDocRef, updatedFormData);
        console.log("Document updated successfully");

        const updatedOrders = [...orders];
        const index = updatedOrders.findIndex(
          (o) => o.orderId === updatedFormData.orderId
        );
        if (index !== -1) {
          updatedOrders[index] = updatedFormData;
          setOrders(updatedOrders);
        }
      } else {
        const docRef = await addDoc(collection(db, "orders"), updatedFormData);
        console.log("Document written with ID: ", docRef.id);
        updatedFormData.orderId = docRef.id;

        setOrders((prevOrders) => [updatedFormData]);
        setFilteredCustomers([]); 
      }

      setFormData({
        customerId: "",
        customerName: "",
        orderPayment: "",
        status: "",
        orderItems: [{ category: "", subCategory: "", weight: "", pricePerKg: 0 }],
        totalWeight:0,
        totalPrice: 0,
        phone:''
      });

      if (formData.customerId) {
        await calculateAndSetCustomerFrequency(formData.customerId);
      }
    } catch (error) {
      console.error("Error adding/updating document: ", error);
    }
  };

  const handleSelectChange = (value: string) => {
    const selectedCustomerByName = customerNames.find((customer) => customer.name === value);
    const selectedCustomerByPhone = customerNames.find((customer) => customer.number === value);

    const selectedCustomer = selectedCustomerByName || selectedCustomerByPhone;

    if (selectedCustomer) {
      setFormData((prevState) => ({
        ...prevState,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        phone: selectedCustomer.number,
      }));
      setSelectedCustomerId(selectedCustomer.id); // Set the selected customer ID
    }
  };

  const handleOrderStatusChange = (value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      status: value,
    }));
  };

  const handleCategoryChange = (index: number, value: string) => {
    const updatedOrderItems = [...formData.orderItems];
    updatedOrderItems[index].category = value;
    updatedOrderItems[index].subCategory = "";

    const selectedCategory = DropDown.find((item) => item.mainCategory === value);
    if (selectedCategory) {
      setSubCategories(selectedCategory.subCategory);
    } else {
      setSubCategories([]);
    }

    setFormData((prevState) => ({
      ...prevState,
      orderItems: updatedOrderItems,
    }));
  };

  const handleSubCategoryChange = (index: number, value: string) => {
    const updatedOrderItems = [...formData.orderItems];
    updatedOrderItems[index].subCategory = value;
    setFormData((prevState) => ({
      ...prevState,
      orderItems: updatedOrderItems,
    }));
  };

  const [queryName, setQueryName] = useState<string | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  
    if (name === 'phone') {
      // Track the query name for filtering
      let queryName: string | null = null;
  
      // Filter customers based on the input value
      const filtered = customerNames
        .map((customer) => {
          const customerNumber = customer.number || '';
          const customerCompany = customer.company || '';
          const customerRegistration = customer.registration || '';
          const customerLicense = customer.license || '';
          const customerEmail = customer.email || '';
  
          let matchType: string | null = null;
  
          if (customerNumber.includes(value)) {
            matchType = 'number';
            queryName = 'number'; // Update queryName if a match is found
          } else if (customerCompany.toLowerCase().includes(value.toLowerCase())) {
            matchType = 'company';
            queryName = 'company'; // Update queryName if a match is found
          } else if (customerRegistration.toLowerCase().includes(value.toLowerCase())) {
            matchType = 'registration';
            queryName = 'registration'; // Update queryName if a match is found
          } else if (customerLicense.toLowerCase().includes(value.toLowerCase())) {
            matchType = 'license';
            queryName = 'license'; // Update queryName if a match is found
          } else if (customerEmail.toLowerCase().includes(value.toLowerCase())) {
            matchType = 'email';
            queryName = 'email'; // Update queryName if a match is found
          }
  
          if (matchType) {
            return { ...customer, matchType };
          } else {
            return null;
          }
        })
        .filter((customer) => customer !== null) as (Customer & { matchType: string })[];
  
      setFilteredCustomers(filtered);
      setQueryName(queryName); // Update state with the matched query name
  
      if (value === '') {
        setFilteredCustomers([]);
        setQueryName(null); // Reset queryName when input is empty
      }
  
      // Automatically select the customer if an exact match is found
      const exactMatchCustomer = customerNames.find((customer) => customer.number === value);
      if (exactMatchCustomer) {
        handleSelectChange(value);
      }
    }
  };
  

  const handleOrderItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string
  ) => {
    const updatedOrderItems = [...formData.orderItems];
    (updatedOrderItems[index][field] as any) = value; // Type assertion here
  
    const totalPrice = updatedOrderItems.reduce((total, item) => {
      const weight = parseFloat(item.weight);
      const pricePerKg = parseFloat(item.pricePerKg.toString());
  
      if (!isNaN(weight) && !isNaN(pricePerKg)) {
        return total + weight * pricePerKg;
      } else {
        return total;
      }
    }, 0);
    setFormData((prevState) => ({
      ...prevState,
      orderItems: updatedOrderItems,
      totalWeight: isNaN(totalWeight) ? 0 : totalWeight,
      TotalWeight: isNaN(totalWeight) ? "" : totalWeight.toFixed(2),
    }));
  
    setFormData((prevState) => ({
      ...prevState,
      orderItems: updatedOrderItems,
      totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
      orderPayment: isNaN(totalPrice) ? "" : totalPrice.toFixed(2),
    }));
  };
  

  const addOrderItem = () => {
    const lastItem = formData.orderItems[formData.orderItems.length - 1];
    if (
      lastItem.category !== "" &&
      lastItem.subCategory !== "" &&
      lastItem.weight !== ""
    ) {
      setFormData((prevState) => ({
        ...prevState,
        orderItems: [
          ...prevState.orderItems,
          { category: "", subCategory: "", weight: "", pricePerKg: 0 },
        ],
      }));
    }
  };

  const removeOrderItem = (index: number) => {
    const updatedOrderItems = formData.orderItems.filter((_, i) => i !== index);
    setFormData((prevState) => ({
      ...prevState,
      orderItems: updatedOrderItems,
    }));
  };

  const editOrder = (order: FormData) => {
    setFormData({
      customerId: order.customerId,
      customerName: order.customerName,
      orderPayment: order.orderPayment,
      status: order.status,
      orderItems: order.orderItems,
      totalWeight:order.totalWeight,
      totalPrice: order.totalPrice,
      orderId: order.orderId,
      phone:order.phone
    });
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, "orders", orderId));
      console.log("Document successfully deleted");

      setOrders((prevOrders) => prevOrders.filter((o) => o.orderId !== orderId));
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  const calculateAndSetCustomerFrequency = async (customerId: string) => {
    try {
      // Fetch all orders for the customer
      const ordersQuery = query(
        collection(db, "orders"),
        where("customerId", "==", customerId),
        orderBy("orderDate", "desc"),
        limit(5)  // Fetch all orders in descending order of date
      );
      const querySnapshot = await getDocs(ordersQuery);
  
      if (querySnapshot.docs.length > 1) {
        // Extract and filter unique dates
        const orderDates = querySnapshot.docs
          .map(doc => new Date(doc.data().orderDate))
          .filter((date, index, self) => 
            index === self.findIndex(d => d.getTime() === date.getTime())
          )
          .sort((a, b) => b.getTime() - a.getTime()); // Sort in descending order
  
        console.log("Unique Customers orderDates Fetch:", orderDates);
  
        // Calculate day differences between unique dates
        const dayDifferences: number[] = [];
        for (let i = 0; i < orderDates.length - 1; i++) {
          const diffInMs = orderDates[i].getTime() - orderDates[i + 1].getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          dayDifferences.push(diffInDays);
        }
  
        console.log("Day Differences:", dayDifferences);
  
        // Calculate Mean
        const meanFrequency = dayDifferences.reduce((acc, val) => acc + val, 0) / dayDifferences.length;
  
        // Calculate Median
        const sortedDifferences = dayDifferences.sort((a, b) => a - b);
        const mid = Math.floor(sortedDifferences.length / 2);
        const medianFrequency = sortedDifferences.length % 2 === 0
          ? (sortedDifferences[mid - 1] + sortedDifferences[mid]) / 2
          : sortedDifferences[mid];
  
        console.log("Mean Frequency (Days):", meanFrequency);
        console.log("Median Frequency (Days):", medianFrequency);
  
        // Update the customer's frequency (Choose either mean or median)
        // Uncomment the line below to use the mean frequency
        await updateDoc(doc(db, 'customers', customerId), { frequency: meanFrequency });
  
        // Uncomment the line below to use the median frequency
        // await updateDoc(doc(db, 'customers', customerId), { frequency: medianFrequency });
      }
    } catch (error) {
      console.error("Error calculating and setting customer frequency: ", error);
    }
  };

  const handleDisplay = (customer: CustomerWithMatchType) => {
    return (
      <div>
        {customer[queryName as keyof CustomerWithMatchType] || 'No data available'}
      </div>
    );
  };
  
  console.log("Customers Name and number:",customerNames);
console.log("Selected Customer Id:",selectedCustomerId);
console.log(" Customer orders:",orders);
console.log("order Categories:",orderCategories)
console.log("Filter Key:",queryName)

  return (
    <Layout>
<form onSubmit={handleFormSubmit} className="p-4">
  <Card className="w-full max-md h-auto">
    <CardHeader>
      <CardTitle>Place Your Order</CardTitle>
      <CardDescription>Fill out the form to submit your order.</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
      <Input
        id="phone"
        name="phone"
        type="text"
        value={formData.phone}
        onChange={(e) => {
          handleInputChange(e);
          setIsDropdownVisible(true)
          // Handle any other logic if needed
        }}
        placeholder="Enter mobile number to select Customer"
        required
      />
       {(isDropdownVisible && filteredCustomers.length != 0) && (
        <ul className=" overflow-y-auto h-[200px] p-2 border-2 mt-1 rounded-xl">
          {filteredCustomers.map((customer) => (
              <li
                key={customer.id}
                onClick={() => {handleSelectChange(customer.number); setIsDropdownVisible(false)}}
                style={{ cursor: 'pointer', padding: '5px 0' }} 
                className=" hover:bg-[#ff9e00] border rounded-sm border-transparent"
              >
                  {handleDisplay(customer)}
              </li>
            ))}
        </ul>
      )}
      <Label htmlFor="customerName">Customer Name</Label>
      <div style={{ position: 'relative' }} className=" ">
      <input
        type="text"
        value={formData.customerName}
        placeholder="Select customer here"
        style={{ width: '600px', padding: '8px' }}
        className=" border-2 rounded-xl"
        disabled
      />
    </div>
    </div>
        <div className="space-y-2">
          <Label htmlFor="status">Order Status</Label>
          <Select onValueChange={handleOrderStatusChange} value={formData.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.orderItems.map((item, index) => (
          <Card key={index} className="w-full max-md h-auto">
            <CardHeader>
              <CardTitle>Order Item {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={`category-${index}`}>Category</Label>
                <Select
                  onValueChange={(value) => handleCategoryChange(index, value)}
                  value={item.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DropDown.map((dropdown) => (
                      <SelectItem key={dropdown.mainCategory} value={dropdown.mainCategory}>
                        {dropdown.mainCategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`subCategory-${index}`}>Sub Category</Label>
                <Select
                  onValueChange={(value) => handleSubCategoryChange(index, value)}
                  value={item.subCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((subCategory) => (
                      <SelectItem key={subCategory} value={subCategory}>
                        {subCategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`weight-${index}`}>Weight</Label>
                <Input
                  id={`weight-${index}`}
                  type="text"
                  value={item.weight}
                  onChange={(e) => handleOrderItemChange(index, "weight", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`pricePerKg-${index}`}>Price per Kg</Label>
                <Input
                  id={`pricePerKg-${index}`}
                  type="number"
                  step="0.01"
                  value={item.pricePerKg.toString()}
                  onChange={(e) => handleOrderItemChange(index, "pricePerKg", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={() => removeOrderItem(index)} className="mr-2">
                Remove Item
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <Button type="button" onClick={addOrderItem}>
          Add Order Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="orderPayment">Order Payment</Label>
          <Input
            id="orderPayment"
            type="text"
            value={formData.orderPayment}
            onChange={handleInputChange}
            disabled
          />
        </div>

        <div className="md:col-span-2">
          <CardTitle className="text-sm">Total Weight</CardTitle>
          <Card className="w-full h-10">
            <CardContent>
              <p>{totalWeight} kg</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button type="submit">Submit Order</Button>
      </div>
    </CardContent>
  </Card>
</form>
      <Card className="mt-4 mb-5 max-md h-auto mx-3">
  <CardHeader>
    <CardTitle>Notes</CardTitle>
    <CardDescription>Customer Notes</CardDescription>
    <hr/>
  </CardHeader>
  <CardContent>
  <div className="flex flex-col gap-4">
                  <CustomerNoteOders uid={selectedCustomerId} />
                </div>
    </CardContent>
    </Card>

      <Card className="mt-4 mb-5 max-md h-auto mx-3">
  <CardHeader>
    <CardTitle>Orders List</CardTitle>
    <CardDescription>Manage existing orders.</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Customer Name</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Order Items</th>
            <th className="border border-gray-300 px-4 py-2">Total Weight</th>
            <th className="border border-gray-300 px-4 py-2">Total Price</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{order.customerName}</td>
              <td className="border border-gray-300 px-4 py-2">{order.status}</td>
              <td className="border border-gray-300 px-4 py-2">
                <ul>
                  {order.orderItems.map((item, index) => (
                    <li key={index}>
                      {item.category} - {item.subCategory} - {item.weight}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="border border-gray-300 px-4 py-2">{order.totalWeight.toFixed(2)}</td>
              <td className="border border-gray-300 px-4 py-2"> AU$ {order.totalPrice.toFixed(2)}</td>
              <td className="border border-gray-300 px-4 py-2">
                <Button
                  className="mr-2"
                  onClick={() => editOrder(order)}
                  variant="secondary"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => deleteOrder(order.orderId!)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>
</Layout>
  );
}
