import { useEffect, useState } from "react";
import { db } from "@/firebase"; // Adjust the path as per your project structure
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { collection, addDoc, getDocs } from "firebase/firestore";

const Component: React.FC = () => {
  const [customerData, setCustomerData] = useState<any[]>([]); // State to hold array of customer data

  useEffect(() => {
    // Fetch data from Firestore on component mount
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "customers"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomerData(data);
    };

    fetchData();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Example: Add data to Firestore
    await addDoc(collection(db, "customers"), {
      name: (event.currentTarget.elements.namedItem("name") as HTMLInputElement).value,
      email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value,
      phone: (event.currentTarget.elements.namedItem("phone") as HTMLInputElement).value,
      created: new Date().toISOString() // Add a timestamp for when the customer was created
    });
    alert("Customer created successfully!");
    fetchData(); // Fetch updated data after adding a new customer
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="grid gap-6 md:grid-cols-1 ">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Create New Customer</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" type="text" placeholder="Enter customer name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Enter customer email" required />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="Enter customer phone number" required />
            </div>
            <Button type="submit" className="w-full">
              Create Customer
            </Button>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
          {customerData.length > 0 ? (
            <div className="">
              <table className="min-w-full divide-y divide-gray-200 p-3">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerData.map(customer => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(customer.created).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <Button variant="outline">Edit</Button> */}
                        <Button variant="destructive">Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No customers found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Component;

function fetchData() {
  throw new Error("Function not implemented.");
}
