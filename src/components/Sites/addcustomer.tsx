import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import CustomerDetail from "../CustomerDetail"; // Assuming you create CustomerDetail component separately
import Layout from "@/components/layout";

interface Props {
  customer: any;
  onClose: () => void;
}

const Component: React.FC<Props> = ({ customer, onClose }) => {
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCustomerData(data);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addDoc(collection(db, "customers"), {
      name: (event.currentTarget.elements.namedItem("name") as HTMLInputElement).value,
      email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value,
      phone: (event.currentTarget.elements.namedItem("phone") as HTMLInputElement).value,
      website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement).value,
      address: (event.currentTarget.elements.namedItem("address") as HTMLInputElement).value,
      frequency: (event.currentTarget.elements.namedItem("frequency") as HTMLInputElement).value,
      created: new Date().toISOString()
    });
    alert("Customer created successfully!");
    fetchData();
    setShowCreateModal(false);
  };

  const handleEditClick = (customer: any) => {
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
    const customerId = editingCustomer.id;
    await updateDoc(doc(db, "customers", customerId), {
      name: (event.currentTarget.elements.namedItem("name") as HTMLInputElement).value,
      email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value,
      phone: (event.currentTarget.elements.namedItem("phone") as HTMLInputElement).value,
      website: (event.currentTarget.elements.namedItem("website") as HTMLInputElement).value,
      address: (event.currentTarget.elements.namedItem("address") as HTMLInputElement).value,
      frequency: (event.currentTarget.elements.namedItem("frequency") as HTMLInputElement).value,
    });
    alert("Customer updated successfully!");
    setShowEditModal(false);
    fetchData();
  };

  return (
      <div className="max-w-7xl mx-auto md:p-10 p-4">
      <div className="flex justify-end mb-4">
  <Button onClick={() => setShowCreateModal(true)} style={{ backgroundColor: "#00215E", color: "white" }}>
    Add Customer
  </Button>
</div>


        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4 ">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Create New Customer</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4" >
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
                  <Button type="submit" className="w-full">Create Customer</Button>
                </div>
              </form>
              <Button onClick={() => setShowCreateModal(false)} className="mt-4 w-full">Cancel</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {customerData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerData.map(customer => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href="#">
                        <p
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
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
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(customer.created).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button onClick={() => handleEditClick(customer)} variant="outline">Edit</Button>
                      <Button className="ml-2" onClick={() => handleDeleteClick(customer.id)} variant="destructive">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No customers found.</p>
          )}
        </div>

        {showEditModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Edit Customer</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" type="text" placeholder="Enter customer name" defaultValue={editingCustomer.name} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="Enter customer email" defaultValue={editingCustomer.email} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="Enter customer phone number" defaultValue={editingCustomer.phone} required />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="text" placeholder="Enter customer website" defaultValue={editingCustomer.website} required />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" type="text" placeholder="Enter customer address" defaultValue={editingCustomer.address} required />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input id="frequency" name="frequency" type="text" placeholder="Enter customer frequency" defaultValue={editingCustomer.frequency} required />
                  </div>
                  <Button type="submit" className="w-full">Save Changes</Button>
                </div>
              </form>
              <Button onClick={() => setShowEditModal(false)} className="mt-4 w-full">Cancel</Button>
            </div>
          </div>
        )}

       
      </div>
    
  );
};

export default Component;
