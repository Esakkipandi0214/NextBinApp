// CustomerDetail.tsx

import React from "react";

interface CustomerDetailProps {
  customer: {
    name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    frequency: string;
    created: string;
    // Add additional fields like lastOrder and lastContactedType as needed
  };
  onClose: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">{customer.name}</h2>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Website:</strong> {customer.website}</p>
        <p><strong>Address:</strong> {customer.address}</p>
        <p><strong>Frequency:</strong> {customer.frequency}</p>
        <p><strong>Created:</strong> {new Date(customer.created).toLocaleDateString()}</p>
        {/* Additional details like last order and last contacted type can be displayed here */}
        <button onClick={onClose} className="mt-4 w-full">Close</button>
      </div>
    </div>
  );
};

export default CustomerDetail;
