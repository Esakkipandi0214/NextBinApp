import React, { useEffect, useState } from 'react';
import { db } from '@/firebase'; // Adjust the import path as necessary
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

type GuestCustomer = {
  id: string; // Add an id field to track document ID
  name: string;
  contactNumber: string;
  companyName: string;
  notes: string;
  createdAt: string; // Date stored as ISO string
};

const GuestCustomerTable: React.FC = () => {
  const [customers, setCustomers] = useState<GuestCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<GuestCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTerm, setFilterTerm] = useState<string>('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'GuestCustomers'));
        const fetchedCustomers: GuestCustomer[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id, // Retrieve and store document ID
            ...data,
            createdAt: data.createdAt.toDate().toISOString() // Convert Firestore timestamp to ISO string
          } as GuestCustomer;
        });
        setCustomers(fetchedCustomers);
        setFilteredCustomers(fetchedCustomers); // Initialize with all customers
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to fetch customer data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (filterTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
        customer.contactNumber.toLowerCase().includes(filterTerm.toLowerCase()) ||
        customer.companyName.toLowerCase().includes(filterTerm.toLowerCase()) ||
        new Date(customer.createdAt).toLocaleDateString().includes(filterTerm)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [filterTerm, customers]);

  const handleDelete = async (id: string) => {
    try {
      // Create a reference to the document to be deleted
      const docRef = doc(db, 'GuestCustomers', id);
      
      // Delete the document
      await deleteDoc(docRef);

      // Update state to remove deleted customer
      setCustomers(customers.filter(customer => customer.id !== id));
      setFilteredCustomers(filteredCustomers.filter(customer => customer.id !== id));

      
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="mt-8 overflow-x-auto px-8">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg"
        />
      </div>
      <table className="w-full border-collapse border border-gray-300 bg-white rounded-2xl">
        <thead className="bg-blue-600 text-white border rounded-xl">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Contact Number</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Company Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Actions</th> {/* Add Actions column */}
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <tr
                key={customer.id} // Use document ID as key
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-gray-100`}
              >
                <td className="border border-gray-300 px-4 py-2">{customer.name}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.contactNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.companyName}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.notes}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(customer.createdAt).toLocaleDateString()}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className=" text-white hover:bg-red-500 p-1 text-sm border border-white rounded-md bg-violet-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="border border-gray-300 px-4 py-2 text-center text-gray-500">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GuestCustomerTable;
