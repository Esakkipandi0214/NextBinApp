import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  license: string;
  dob: string;
  email: string;
  address: string;
  postcode: string;
  frequency: string;
  registration: string;
  created: string;
  Company:string;
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
          <div><p><strong>First Name:</strong> {customer.firstName}</p></div>
          <div><p><strong>Last Name:</strong> {customer.lastName}</p></div>
          <div><p><strong>Phone:</strong> {customer.phone}</p></div>
          <div><p><strong>Email:</strong> {customer.email}</p></div>
          <div><p><strong>Company:</strong> {customer.Company}</p></div>
          <div><p><strong>License:</strong> {customer.license}</p></div>
          <div><p><strong>Date of Birth:</strong> {customer.dob}</p></div>
          <div><p><strong>Address:</strong> {customer.address}</p></div>
          <div><p><strong>Postcode:</strong> {customer.postcode}</p></div>
          <div><p><strong>Frequency:</strong> {customer.frequency}</p></div>
          <div><p><strong>Registration:</strong> {customer.registration}</p></div>
          <div><p><strong>Created:</strong> {new Date(customer.created).toLocaleDateString()}</p></div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} className="w-full" style={{ backgroundColor: "#00215E", color: "white" }}>
            Close
          </Button>
        </div>
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
    
    // Sort the customer data by registration number in ascending order
    const sortedData = data.sort((a, b) => parseInt(a.registration) - parseInt(b.registration));
    
    setCustomerData(sortedData);
  };

  

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const registrationNumber = `${customerData.length + 1}`;

  await addDoc(collection(db, "customers"), {
    firstName: (event.currentTarget.elements.namedItem("firstName") as HTMLInputElement).value,
    lastName: (event.currentTarget.elements.namedItem("lastName") as HTMLInputElement).value,
    name: `${(event.currentTarget.elements.namedItem("firstName") as HTMLInputElement).value} ${(event.currentTarget.elements.namedItem("lastName") as HTMLInputElement).value}`, // Combine first and last name,
    phone: `${(event.currentTarget.elements.namedItem("countryCode") as HTMLSelectElement).value} ${(event.currentTarget.elements.namedItem("phone") as HTMLInputElement).value}`,
    license: (event.currentTarget.elements.namedItem("license") as HTMLInputElement).value,
    dob: (event.currentTarget.elements.namedItem("dob") as HTMLInputElement).value,
    address: (event.currentTarget.elements.namedItem("address") as HTMLInputElement).value,
    postcode: (event.currentTarget.elements.namedItem("postcode") as HTMLInputElement).value,
    frequency: (event.currentTarget.elements.namedItem("frequency") as HTMLInputElement).value,
    registration: (event.currentTarget.elements.namedItem("registerno") as HTMLInputElement)?.value || '',
    Company: (event.currentTarget.elements.namedItem("company") as HTMLInputElement)?.value || '',
    created: new Date().toISOString(),
    email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value, // Add this line
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
  
    // Collect updated values
    const updatedData: Partial<Customer> = {
      firstName: (event.currentTarget.elements.namedItem("firstName") as HTMLInputElement)?.value || '',
      lastName: (event.currentTarget.elements.namedItem("lastName") as HTMLInputElement)?.value || '',
      phone: `${(event.currentTarget.elements.namedItem("countryCode") as HTMLSelectElement)?.value || ''} ${(event.currentTarget.elements.namedItem("phone") as HTMLInputElement)?.value || ''}`,
      license: (event.currentTarget.elements.namedItem("license") as HTMLInputElement)?.value || '',
      dob: (event.currentTarget.elements.namedItem("dob") as HTMLInputElement)?.value || '',
      address: (event.currentTarget.elements.namedItem("address") as HTMLInputElement)?.value || '',
      postcode: (event.currentTarget.elements.namedItem("postcode") as HTMLInputElement)?.value || '',
      frequency: (event.currentTarget.elements.namedItem("frequency") as HTMLInputElement)?.value || '',
      email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement)?.value || '', // Add this line
      registration: (event.currentTarget.elements.namedItem("registerno") as HTMLInputElement)?.value || '',
      Company: (event.currentTarget.elements.namedItem("company") as HTMLInputElement)?.value || ''
    };
  
    try {
      await updateDoc(doc(db, "customers", editingCustomer.id), updatedData);
      alert("Customer updated successfully!");
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer.");
    }
  };
  
  

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setShowEditModal(false);
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Create New Customer</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" type="text" placeholder="Enter first name" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" type="text" placeholder="Enter last name" required />
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
                  <Input id="phone" name="phone" type="tel" placeholder="Enter phone number" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" type="text" placeholder="Enter company" required />
                </div>
                <div>
                  <Label htmlFor="license">License</Label>
                  <Input id="license" name="license" type="text" placeholder="Enter license" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registerno">Reg NO</Label>
                  <Input id="registerno" name="registerno" type="text" placeholder="Enter registerno" required />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" placeholder="Enter date of birth" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="Enter email address" required />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" type="text" placeholder="Enter address" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" name="postcode" type="text" placeholder="Enter postcode" required />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input id="frequency" name="frequency" type="text" placeholder="Enter frequency" required />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="submit" style={{ backgroundColor: "#00215E", color: "white" }}>
                Save
              </Button>
              <Button type="button" onClick={handleCancelCreate} className="bg-gray-300 text-black">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
      
        )}

        {showEditModal && editingCustomer && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Customer</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      defaultValue={editingCustomer.firstName || ''}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      defaultValue={editingCustomer.lastName}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="countryCode">Country Code</Label>
                    <select
                      id="countryCode"
                      name="countryCode"
                      className="block w-full border border-gray-300 rounded-md py-2 px-3"
                      defaultValue={editingCustomer.phone.split(' ')[0]}
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
                      defaultValue={editingCustomer.phone.split(' ')[1]}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="license">License</Label>
                    <Input
                      id="license"
                      name="license"
                      type="text"
                      defaultValue={editingCustomer.license}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      defaultValue={editingCustomer.Company}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      defaultValue={editingCustomer.dob}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingCustomer.email}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      defaultValue={editingCustomer.address}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      type="text"
                      defaultValue={editingCustomer.postcode}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input
                      id="frequency"
                      name="frequency"
                      type="text"
                      defaultValue={editingCustomer.frequency}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <Button
                  type="submit"
                  style={{ backgroundColor: '#00215E', color: 'white' }}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-300 text-black"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        )}

        {showCustomerDetail && selectedCustomer && (
          <CustomerDetail customer={selectedCustomer} onClose={() => setShowCustomerDetail(false)} />
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4">S.No</th>
                <th className="py-2 px-4">First Name</th>
                <th className="py-2 px-4">Last Name</th>
                <th className="py-2 px-4">Phone</th>
                <th className="py-2 px-4">License</th>
                <th className="py-2 px-4">Postcode</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customerData.map((customer,index) => (
                <tr key={index}>
                  <td className="py-2 px-4">{index+1}</td>
                  <td className="py-2 px-4">{customer.firstName}</td>
                  <td className="py-2 px-4">{customer.lastName}</td>
                  <td className="py-2 px-4">{customer.phone}</td>
                  <td className="py-2 px-4">{customer.license}</td>
                  <td className="py-2 px-4">{customer.postcode}</td>
                  <td className="py-2 px-4 flex space-x-2">
                    <Button size="sm" onClick={() => { setSelectedCustomer(customer); setShowCustomerDetail(true); }}>
                      View
                    </Button>
                    <Button size="sm" onClick={() => handleEditClick(customer)}>
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => handleDeleteClick(customer.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Component;
