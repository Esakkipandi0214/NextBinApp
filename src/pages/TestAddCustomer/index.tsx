import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  frequency: string;
  created: string;
}

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Customer Detail</h2>
        <div className="space-y-4">
          <div>
            <p><strong>Name:</strong> {customer.name}</p>
          </div>
          <div>
            <p><strong>Email:</strong> {customer.email}</p>
          </div>
          <div>
            <p><strong>Phone:</strong> {customer.phone}</p>
          </div>
          <div>
            <p><strong>Website:</strong> {customer.website}</p>
          </div>
          <div>
            <p><strong>Address:</strong> {customer.address}</p>
          </div>
          <div>
            <p><strong>Frequency:</strong> {customer.frequency}</p>
          </div>
          <div>
            <p><strong>Created:</strong> {customer.created}</p>
          </div>
        </div>
        <Button onClick={onClose} className="mt-4 w-full">
          Close
        </Button>
      </div>
    </div>
  );
};

const Component: React.FC = () => {
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Customer[];
    setCustomerData(data);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addDoc(collection(db, "customers"), {
      name: (event.currentTarget.elements.namedItem("name") as HTMLInputElement).value,
      email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value,
      phone: `${(event.currentTarget.elements.namedItem("countryCode") as HTMLSelectElement).value} ${(event.currentTarget.elements.namedItem("phone") as HTMLInputElement).value}`,
      website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement).value,
      address: (event.currentTarget.elements.namedItem("address") as HTMLInputElement).value,
      frequency: (event.currentTarget.elements.namedItem("frequency") as HTMLInputElement).value,
      created: new Date().toISOString(),
    });
    alert("Customer created successfully!");
    fetchData();
    setShowCreateModal(false);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (customerId: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      await deleteDoc(doc(db, "customers", customerId));
      alert("Customer deleted successfully!");
      fetchData();
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCustomer) return;

    await updateDoc(doc(db, "customers", editingCustomer.id), {
      name: (event.currentTarget.elements.namedItem("name") as HTMLInputElement).value,
      email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value,
      phone: `${(event.currentTarget.elements.namedItem("countryCode") as HTMLSelectElement).value} ${(event.currentTarget.elements.namedItem("phone") as HTMLInputElement).value}`,
      website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement).value,
      address: (event.currentTarget.elements.namedItem("address") as HTMLInputElement).value,
      frequency: (event.currentTarget.elements.namedItem("frequency") as HTMLInputElement).value,
    });
    alert("Customer updated successfully!");
    setShowEditModal(false);
    fetchData();
  };

  const countryCodes = [
    { code: "+1", name: "United States" },
    { code: "+44", name: "United Kingdom" },
    { code: "+91", name: "India" },
    { code: "+61", name: "Australia" },
    // Add more country codes as needed
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto md:p-10 p-4">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowCreateModal(true)} style={{ backgroundColor: "#00215E", color: "white" }}>
            Add Customer
          </Button>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Create New Customer</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="countryCode">Country Code</Label>
                      <select id="countryCode" name="countryCode" className="block w-full border border-gray-300 rounded-md py-2 px-3">
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name} ({country.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="Enter customer phone number" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="text" placeholder="Enter customer website" required />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" type="text" placeholder="Enter customer address" required />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input id="frequency" name="frequency" type="text" placeholder="Enter customer frequency" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Customer
                  </Button>
                </div>
              </form>
              <Button onClick={() => setShowCreateModal(false)} className="mt-4 w-full">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {customerData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerData.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href="#">
                        <p
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerDetail(true);
                          }}
                        >
                          {customer.name}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.website}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.frequency}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.created}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        onClick={() => handleEditClick(customer)}
                        style={{ backgroundColor: "#00215E", color: "white" }}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(customer.id)}
                        style={{ backgroundColor: "red", color: "white" }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p>No customer data available.</p>
            </div>
          )}
        </div>

        {showEditModal && editingCustomer && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Edit Customer</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" type="text" defaultValue={editingCustomer.name} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={editingCustomer.email} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="countryCode">Country Code</Label>
                      <select
                        id="countryCode"
                        name="countryCode"
                        className="block w-full border border-gray-300 rounded-md py-2 px-3"
                        defaultValue={editingCustomer.phone.split(" ")[0]}
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name} ({country.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={editingCustomer.phone.split(" ")[1]}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="text" defaultValue={editingCustomer.website} required />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" type="text" defaultValue={editingCustomer.address} required />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input id="frequency" name="frequency" type="text" defaultValue={editingCustomer.frequency} required />
                  </div>
                  <Button type="submit" className="w-full">
                    Update Customer
                  </Button>
                </div>
              </form>
              <Button onClick={() => setShowEditModal(false)} className="mt-4 w-full">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showCustomerDetail && selectedCustomer && (
          <CustomerDetail
            customer={selectedCustomer}
            onClose={() => setShowCustomerDetail(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Component;
