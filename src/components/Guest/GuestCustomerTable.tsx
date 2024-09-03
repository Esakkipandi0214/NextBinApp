import React, { useEffect, useState } from 'react';
import { db } from '@/firebase'; // Adjust the import path as necessary
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

type GuestCustomer = {
  id: string;
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
  const [msgModal, setMsgModal] = useState<boolean>(false);
  const [confirmMsg, setConfirmMsg] = useState<boolean | null>(null); // Using boolean or null for clear states
  const [deleteId, setDeleteId] = useState<string | null>(null); // Store ID to be deleted

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'GuestCustomers'));
        const fetchedCustomers: GuestCustomer[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate().toISOString(), // Ensure Firestore timestamp conversion
          } as GuestCustomer;
        });
        setCustomers(fetchedCustomers);
        setFilteredCustomers(fetchedCustomers);
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
      const filtered = customers.filter(
        (customer) =>
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

  useEffect(() => {
    if (confirmMsg === true && deleteId) {
      handleDelete(deleteId);
      setConfirmMsg(null);
      setDeleteId(null);
    }
  }, [confirmMsg, deleteId]);

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, 'GuestCustomers', id);
      await deleteDoc(docRef);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      setFilteredCustomers((prev) => prev.filter((customer) => customer.id !== id));
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  const handleDeleteRoute = (id: string) => {
    setDeleteId(id); // Set the ID of the customer to be deleted
    setMsgModal(true); // Show confirmation modal
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
            <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <tr
                key={customer.id}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
              >
                <td className="border border-gray-300 px-4 py-2">{customer.name}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.contactNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.companyName}</td>
                <td className="border border-gray-300 px-4 py-2">{customer.notes}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleDeleteRoute(customer.id)}
                    className="text-white hover:bg-red-500 p-1 text-sm border border-white rounded-md bg-violet-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="border border-gray-300 px-4 py-2 text-center text-gray-500"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {msgModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-lg z-50">
          <div className="relative w-full border-2 border-green-400 max-w-lg p-6 bg-green-500/15 rounded-lg shadow-lg">
            <h1 className="text-black">Message</h1>
            <p className="text-white text-lg font-medium py-3">
              Are you sure you want to delete this guest customer?
            </p>
            <div className="flex px-20 gap-x-24 py-3">
              <button
                onClick={() => {
                  setConfirmMsg(true);
                  setMsgModal(false);
                }}
                className="bg-red-500 hover:bg-red-500/70 text-white w-16 rounded-xl border"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setConfirmMsg(false);
                  setMsgModal(false);
                }}
                className="p-1 bg-violet-700 text-white hover:bg-violet-700/70 w-16 rounded-xl border"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestCustomerTable;
