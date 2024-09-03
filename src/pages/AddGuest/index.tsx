import React, { useState } from 'react';
import AddGuest from "../../components/Guest/AddGuestCustomer";
import GuestCustomerTable from '@/components/Guest/GuestCustomerTable';
import Layout from '@/components/layout';

const Index = () => {
  const [addModel, showAddModel] = useState<boolean>(false);

  return (
    <Layout>
      {!addModel ? (
        <>
          <button 
            className='mt-6 ml-9 text-white bg-red-500 p-1 w-[100px] h-[40px] font-semibold text-sm border rounded-2xl hover:bg-red-600 focus:outline-none'
            onClick={() => showAddModel(true)}
          >
            Add Guest
          </button>
          <GuestCustomerTable />
        </>
      ) : (
        // Modal Overlay
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-lg z-50">
          {/* Modal Content */}
          <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
            {/* Close Button */}
            <button 
              className='absolute right-12 top-11 text-white w-[70px] bg-red-500 p-2 font-semibold text-base border rounded-full hover:bg-red-600 focus:outline-none'
              onClick={() => showAddModel(false)}
            >
              Close
            </button>
            <AddGuest />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
