import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, limit, query, where } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { auth } from '@/firebase';
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  identityProof: string;
  // dob: string;
  email: string;
  address: string;
  postCode: string;
  frequency: string;
  rego: string;
  registration: string;
  created: string;
  companyName: string;
  abn: string;
  factoryLocation: string;
  suburb: string;
  state: string;
  country: string;
  bankAccountName: string;
  bsb: string;
  accountNumber: string;
}

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-2">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-screen overflow-auto">

        <h2 className="text-2xl font-bold mb-4">Customer Detail</h2>
        <div className="space-y-4">
          <div><p><strong>First Name:</strong> {customer.firstName}</p></div>
          <div><p><strong>Last Name:</strong> {customer.lastName}</p></div>
          <div><p><strong>Contact Number:</strong> {customer.contactNumber}</p></div>
          <div><p><strong>Email:</strong> {customer.email}</p></div>
          <div><p><strong>Company Name:</strong> {customer.companyName}</p></div>
          <div><p><strong>Identity Proof:</strong> {customer.identityProof}</p></div>
          <div><p><strong>Address:</strong> {customer.address}</p></div>
          <div><p><strong>Post Code:</strong> {customer.postCode}</p></div>
          <div><p><strong>Frequency:</strong> {customer.frequency}</p></div>
          {/* <div><p><strong>Registration :</strong> {customer.registration}</p></div> */}
          <div><p><strong>Rego Vechile:</strong> {customer.rego}</p></div>
          <div><p><strong>ABN:</strong> {customer.abn}</p></div>
          <div><p><strong>Factory Location:</strong> {customer.factoryLocation}</p></div>
          <div><p><strong>Suburb:</strong> {customer.suburb}</p></div>
          <div><p><strong>State:</strong> {customer.state}</p></div>
          <div><p><strong>Country:</strong> {customer.country}</p></div>
          <div><p><strong>Bank Account Number:</strong> {customer.bankAccountName}</p></div>
          <div><p><strong>BSB:</strong> {customer.bsb}</p></div>
          <div><p><strong>Account Number:</strong> {customer.accountNumber}</p></div>
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
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  // const [registrationFilter, setRegistrationFilter] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [regoFilter, setRegoFilter] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [identityProof, setIdentityProof] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);


  const phoneFilter = countryCode && phoneNumber ? `${countryCode} ${phoneNumber}` : null;
  const router = useRouter();
  const filteredData = phoneNumber
    ? customerData.filter((eachCustomer) =>
      eachCustomer.contactNumber?.toLowerCase().includes(phoneNumber.toLowerCase())
    )
    : customerData; // Show all data if phoneNumber is not provided

  console.log("contact", customerData)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const constraints = [];

    if (companyFilter) {
      constraints.push(where("companyName", "==", companyFilter));
    }
    if (regoFilter) {
      constraints.push(where("rego", "array-contains", regoFilter));
    }
    if (phoneFilter) {
      constraints.push(where("contactNumbers", "array-contains", phoneFilter));
    }
    if (identityProof) {
      constraints.push(where("identityProof", "==", identityProof));
    }

    // constraints.push(limit(constraints.length === 0 ? 8 : 7));

    const q = query(collection(db, "customers"), ...constraints);

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Customer[];

    const sortedData = data.sort((a, b) => parseInt(a.rego) - parseInt(b.rego));

    setCustomerData(sortedData);
  };
  const handleFilterSubmit = () => {
    fetchData();
  };
  const handleFilterReset = () => {
    setCountryCode(null);
    setRegoFilter(null);
    setPhoneNumber(null);
    setIdentityProof(null);
    setCompanyFilter(null);
    if (companyFilter == null && regoFilter == null && phoneFilter == null && identityProof == null && countryCode == null) {
      fetchData();
    }
  };



  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const registrationNumber = `${customerData.length + 1}`;

    const rego1 = (event.currentTarget.elements.namedItem("rego1") as HTMLInputElement).value;
    const rego2 = (event.currentTarget.elements.namedItem("rego2") as HTMLInputElement).value;
    const rego3 = (event.currentTarget.elements.namedItem("rego3") as HTMLInputElement).value;

    // Concatenate the rego values with a slash separator
    const regoArray = [rego1, rego2, rego3].filter(Boolean);

    const countryCode = (event.currentTarget.elements.namedItem("countryCode") as HTMLSelectElement).value;
    const Number = (event.currentTarget.elements.namedItem("Number") as HTMLInputElement).value;
    const alternateNumber = (event.currentTarget.elements.namedItem("alternateNumber") as HTMLInputElement).value;

    // Concatenate the country code with the contact numbers
    const primaryContactNumber = `${countryCode} ${Number}`;
    const alternateContactNumber = alternateNumber ? `${countryCode} ${alternateNumber}` : '';

    // Create an array of contact numbers, excluding empty strings
    const contactNumberArray = [primaryContactNumber, alternateContactNumber].filter(Boolean);


    // Now you can store this concatenated string in your data

    await addDoc(collection(db, "customers"), {
      firstName: (event.currentTarget.elements.namedItem("firstName") as HTMLInputElement).value,
      lastName: (event.currentTarget.elements.namedItem("lastName") as HTMLInputElement).value,
      name: `${(event.currentTarget.elements.namedItem("firstName") as HTMLInputElement).value}${(event.currentTarget.elements.namedItem("lastName") as HTMLInputElement).value}`,
      // contactNumber: `${(event.currentTarget.elements.namedItem("countryCode") as HTMLSelectElement).value} ${(event.currentTarget.elements.namedItem("contactNumber") as HTMLInputElement).value}`,
      contactNumber: contactNumberArray,
      identityProof: (event.currentTarget.elements.namedItem("identityProof") as HTMLInputElement).value,
      address: (event.currentTarget.elements.namedItem("address") as HTMLInputElement).value,
      postCode: (event.currentTarget.elements.namedItem("postCode") as HTMLInputElement).value,
      frequency: (event.currentTarget.elements.namedItem("frequency") as HTMLInputElement).value,
      registration: registrationNumber,
      // rego: (event.currentTarget.elements.namedItem("rego") as HTMLInputElement).value,
      rego: regoArray,
      companyName: (event.currentTarget.elements.namedItem("companyName") as HTMLInputElement).value,
      abn: (event.currentTarget.elements.namedItem("abn") as HTMLInputElement).value,
      factoryLocation: (event.currentTarget.elements.namedItem("factoryLocation") as HTMLInputElement).value,
      suburb: (event.currentTarget.elements.namedItem("suburb") as HTMLInputElement).value,
      state: (event.currentTarget.elements.namedItem("state") as HTMLInputElement).value,
      country: (event.currentTarget.elements.namedItem("country") as HTMLInputElement).value,
      bankAccountName: (event.currentTarget.elements.namedItem("bankAccountName") as HTMLInputElement).value,
      bsb: (event.currentTarget.elements.namedItem("bsb") as HTMLInputElement).value,
      accountNumber: (event.currentTarget.elements.namedItem("accountNumber") as HTMLInputElement).value,
      created: new Date().toISOString(),
      email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value,
    });
    // alert("Customer created successfully!");
    toast.success("Customer created successfully!")
    fetchData();
    setShowCreateModal(false);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (customer: Customer) => {
    console.log("Ffff", customer)
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (customerToDelete) {
      await deleteDoc(doc(db, "customers", customerToDelete.id));
      toast.success("Customer deleted successfully!");
      fetchData();
      setShowDeleteModal(false);
    }
  };



  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingCustomer) {
      await updateDoc(doc(db, "customers", editingCustomer.id), {
        firstName: (event.currentTarget.elements.namedItem("firstName") as HTMLInputElement).value,
        lastName: (event.currentTarget.elements.namedItem("lastName") as HTMLInputElement).value,
        contactNumber: `${(event.currentTarget.elements.namedItem("countryCode") as HTMLSelectElement).value} ${(event.currentTarget.elements.namedItem("contactNumber") as HTMLInputElement).value}`,
        identityProof: (event.currentTarget.elements.namedItem("identityProof") as HTMLInputElement).value,
        address: (event.currentTarget.elements.namedItem("address") as HTMLInputElement).value,
        postCode: (event.currentTarget.elements.namedItem("postCode") as HTMLInputElement).value,
        frequency: (event.currentTarget.elements.namedItem("frequency") as HTMLInputElement).value,
        companyName: (event.currentTarget.elements.namedItem("companyName") as HTMLInputElement).value,
        rego: (event.currentTarget.elements.namedItem("rego") as HTMLInputElement).value,
        abn: (event.currentTarget.elements.namedItem("abn") as HTMLInputElement).value,
        factoryLocation: (event.currentTarget.elements.namedItem("factoryLocation") as HTMLInputElement).value,
        suburb: (event.currentTarget.elements.namedItem("suburb") as HTMLInputElement).value,
        state: (event.currentTarget.elements.namedItem("state") as HTMLInputElement).value,
        country: (event.currentTarget.elements.namedItem("country") as HTMLInputElement).value,
        bankAccountName: (event.currentTarget.elements.namedItem("bankAccountName") as HTMLInputElement).value,
        bsb: (event.currentTarget.elements.namedItem("bsb") as HTMLInputElement).value,
        accountNumber: (event.currentTarget.elements.namedItem("accountNumber") as HTMLInputElement).value,
        email: (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value,
      });
      // alert("Customer updated successfully!");
      toast.success("Customer updated successfully!")
      fetchData();
      setShowEditModal(false);
      setEditingCustomer(null);
    }
  };

  // JavaScript functions to handle specific conditions
  // function handlePhoneNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
  //   const phoneNumber = event.target.value;
  //   if (phoneNumber.length <= 8) {
  //     event.target.value = phoneNumber.padStart(8, '');
  //   }
  // }
  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const countryCode = (document.getElementById("countryCode") as HTMLSelectElement).value;
    const Number = event.target.value;

    // Concatenate country code with the contact number
    const contactNumber = `${countryCode} ${Number}`;

    console.log("Full Phone Number:", contactNumber);
    // Now you can store fullPhoneNumber or use it as needed
  };

  function handleidentityProofChange(event: React.ChangeEvent<HTMLInputElement>) {
    const identityProof = event.target.value;
    if (!identityProof) {
      // alert("Please provide passport details if no driving identityProof is available.");
      toast.error("Please provide passport details if no driving identityProof is available.")

    }
  }

  function handleBSBChange(event: React.ChangeEvent<HTMLInputElement>) {
    const bsb = event.target.value;
    if (bsb.length < 6) {
      event.target.value = bsb.padStart(6, '0');
    }
  }


  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setShowEditModal(false);
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
  };

  const countryCodes = [
    { code: "+61", name: "Australia" },
    // { code: "+91", name: "Australia" }
    // Add more country codes as needed
  ];

  return (
    <Layout>
      <Toaster />
      <Card className="w-full  py-6">
        <div className="max-w-7xl mx-auto md:p-10 p-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowCreateModal(true)} style={{ backgroundColor: "#00215E", color: "white" }}>
              Add Customer
            </Button>
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-2">
              <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-screen overflow-auto">
                <h2 className="text-2xl font-bold mb-4">Create New Customer</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                        <Input id="firstName" name="firstName" type="text" placeholder="Enter first name" required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                        <Input id="lastName" name="lastName" type="text" placeholder="Enter last name" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="countryCode">Country Code <span className="text-red-500">*</span></Label>
                        <select id="countryCode" name="countryCode" className="block w-full border border-gray-300 rounded-md py-2 px-3" required>
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name} ({country.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="contactNumber">Contact Number <span className="text-red-500">*</span></Label>
                        <Input
                          id="primarycontactNumber"
                          name="primarycontactNumber"
                          type="tel"
                          placeholder="Enter phone number"
                          required
                          pattern="\d{10}"
                          minLength={10}
                          maxLength={10}
                          title="Phone number must be exactly 10 digits"
                          onChange={handlePhoneNumberChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactNumber">Alternate Mobile Number</Label>
                        <Input
                          id="alternateContactNumber"
                          name="alternateContactNumber"
                          type="tel"
                          placeholder="Enter alternate mobile number"
                          pattern="\d{10}"
                          minLength={10}
                          maxLength={10}
                          title="Phone number must be exactly 10 digits"
                          onChange={handlePhoneNumberChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="abn">ABN <span className="text-red-500">*</span></Label>
                        <Input id="abn" name="abn" type="text" placeholder="Enter ABN" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="factoryLocation">Factory Location <span className="text-red-500">*</span></Label>
                        <Input id="factoryLocation" name="factoryLocation" type="text" placeholder="Enter factory location" required />
                      </div>
                      <div>
                        <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                        <Input id="companyName" name="companyName" type="text" placeholder="Enter company name" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rego">rego <span className="text-red-500">*</span></Label>
                        <Input id="rego1" name="rego1" type="text" placeholder="Enter rego vechile 1" />

                      </div>
                      <div>
                        <Label htmlFor="rego">rego (Optional)</Label>
                        <Input id="rego2" name="rego2" type="text" placeholder="Enter rego vechile 2" />

                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rego">rego (Optional)</Label>
                        <Input id="rego3" name="rego3" type="text" placeholder="Enter rego vechile 3" />

                      </div>
                      <div>
                        <Label htmlFor="identityProof">Identity Proof <span className="text-red-500">*</span></Label>
                        <Input id="identityProof" name="identityProof" type="text" placeholder="Enter identity proof" onChange={handleidentityProofChange} required />
                        {/* <small>(Authorized Personnel Only)If no driving license, provide passport details. Medicare, Aged care and any other secondary identity cards not accepted.</small> */}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input id="email" name="email" type="email" placeholder="Enter email address" />
                      </div>
                      <div>
                        <Label htmlFor="address">Address: Door No & Street Name <span className="text-red-500">*</span></Label>
                        <Input id="address" name="address" type="text" placeholder="Enter address" required />
                        {/* <Input id="addressAdditional" name="addressAdditional" type="text" placeholder="Enter additional address information" /> */}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="suburb">Suburb <span className="text-red-500">*</span></Label>
                        <Input id="suburb" name="suburb" type="text" placeholder="Enter suburb" required />
                      </div>
                      <div>
                        <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                        <Input id="state" name="state" type="text" placeholder="Enter state" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                        <Input id="country" name="country" type="text" placeholder="Enter country" required />
                      </div>
                      <div>
                        <Label htmlFor="postCode">Post Code <span className="text-red-500">*</span></Label>
                        <Input id="postCode" name="postCode" type="text" placeholder="Enter post code" required pattern="\d{4}" minLength={4} maxLength={4} title="Post code must be exactly 4 digits" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bsb">BSB <span className="text-red-500">*</span></Label>
                        <Input id="bsb" name="bsb" type="text" placeholder="Enter BSB" required onChange={handleBSBChange} />
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequency <span className="text-red-500">*</span></Label>
                        <Input id="frequency" name="frequency" type="text" placeholder="Enter frequency" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankAccountName">Bank Account Name <span className="text-red-500">*</span></Label>
                        <Input id="bankAccountName" name="bankAccountName" type="text" placeholder="Enter bank account name" required />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number <span className="text-red-500">*</span></Label>
                        <Input id="accountNumber" name="accountNumber" type="text" placeholder="Enter account number" required />
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
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-2">
              <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-screen overflow-auto">
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
                        // required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          defaultValue={editingCustomer.lastName}
                        // required
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
                          defaultValue={editingCustomer.contactNumber}
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name} ({country.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          type="tel"
                          defaultValue={editingCustomer.contactNumber}
                        // required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="abn">ABN</Label>
                        <Input
                          id="abn"
                          name="abn"
                          type="text"
                          defaultValue={editingCustomer.abn}
                        // required
                        />
                      </div>
                      <div>
                        <Label htmlFor="factoryLocation">Factory Location</Label>
                        <Input
                          id="factoryLocation"
                          name="factoryLocation"
                          type="text"
                          defaultValue={editingCustomer.factoryLocation}
                        // required
                        />
                      </div>


                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          type="text"
                          defaultValue={editingCustomer.companyName}
                        // required
                        />
                      </div>
                      <div>
                        <Label htmlFor="identityProof">Identity Proof</Label>
                        <Input
                          id="identityProof"
                          name="identityProof"
                          type="text"
                          defaultValue={editingCustomer.identityProof}
                        // required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="suburb">Rego</Label>
                        <Input
                          id="rego"
                          name="rego"
                          type="text"
                          defaultValue={editingCustomer.rego}
                        // required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={editingCustomer.email}
                        // required
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          defaultValue={editingCustomer.address}
                        // required
                        />
                      </div>

                    </div>

                    {/* New Fields Added */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="suburb">Suburb</Label>
                        <Input
                          id="suburb"
                          name="suburb"
                          type="text"
                          defaultValue={editingCustomer.suburb}
                        // required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          type="text"
                          defaultValue={editingCustomer.state}
                        // required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postCode">Post Code</Label>
                        <Input
                          id="postCode"
                          name="postCode"
                          type="text"
                          defaultValue={editingCustomer.postCode}
                        // required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          type="text"
                          defaultValue={editingCustomer.country}
                        // required
                        />
                      </div>


                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bsb">BSB</Label>
                        <Input
                          id="bsb"
                          name="bsb"
                          type="text"
                          defaultValue={editingCustomer.bsb}
                        // required
                        />
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Input
                          id="frequency"
                          name="frequency"
                          type="text"
                          defaultValue={editingCustomer.frequency}
                        // required
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankAccountName">Bank Account Name</Label>
                        <Input
                          id="bankAccountName"
                          name="bankAccountName"
                          type="text"
                          defaultValue={editingCustomer.bankAccountName}
                        // required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          name="accountNumber"
                          type="text"
                          defaultValue={editingCustomer.accountNumber}
                        // required
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
          <div className="overflow-y-auto max-w-full p-4 h-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div>
                <Label htmlFor="companyName">companyName</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={companyFilter || ''}
                  onChange={(e) => setCompanyFilter(e.target.value || null)}
                />
              </div>
              <div>
                <Label htmlFor="rego">rego</Label>
                <Input
                  id="rego"
                  name="rego"
                  type="text"
                  value={regoFilter || ''}
                  onChange={(e) => setRegoFilter(e.target.value || null)}
                />
              </div>
              <div>
                <Label htmlFor="countryCode">Country Code</Label>
                <select
                  id="countryCode"
                  name="countryCode"
                  className="block w-full border border-gray-300 rounded-md py-2 px-3"
                  value={countryCode || ''}
                  onChange={(e) => setCountryCode(e.target.value || null)}
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="contactNumber">contactNumber</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  type="text"
                  value={phoneNumber || ''}
                  placeholder="e.g., 8925722979"
                  pattern="\d{10}"
                  minLength={10}
                  maxLength={10}
                  title="contactNumber  must be exactly 10 digits"
                  onChange={(e) => setPhoneNumber(e.target.value || null)}
                />
              </div>
              <div>
                <Label htmlFor="identityProof">identityProof</Label>
                <Input
                  id="identityProof"
                  name="identityProof"
                  type="text"
                  value={identityProof || ''}
                  onChange={(e) => setIdentityProof(e.target.value || null)}
                />
              </div>
              <div className="flex items-center gap-2 my-1">

                <Button onClick={handleFilterReset}>Reset Filters</Button>

                <Button onClick={handleFilterSubmit}>Apply Filters</Button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4">S.No</th>
                  <th className="py-2 px-4">First Name</th>
                  <th className="py-2 px-4">Last Name</th>
                  <th className="py-2 px-4">contactNumber</th>
                  <th className="py-2 px-4">identityProof</th>
                  <th className="py-2 px-4">postCode</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((customer, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{customer.firstName}</td>
                    <td className="py-2 px-4">{customer.lastName}</td>
                    <td className="py-2 px-4">{customer.contactNumber}</td>
                    <td className="py-2 px-4">{customer.identityProof}</td>
                    <td className="py-2 px-4">{customer.postCode}</td>
                    <td className="py-2 px-4 flex space-x-2">
                      <Button size="sm" onClick={() => { setSelectedCustomer(customer); setShowCustomerDetail(true); }}>
                        View
                      </Button>
                      <Button size="sm" onClick={() => handleEditClick(customer)}>
                        Edit
                      </Button>
                      <Button size="sm" onClick={() => handleDeleteClick(customer)}>
                        Delete
                      </Button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Dialog open={showDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowDeleteModal(false)} className="bg-gray-300 text-black px-4 py-2 rounded">
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle the delete action here
                  confirmDelete();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </Card>
    </Layout>
  );
};

export default Component;
