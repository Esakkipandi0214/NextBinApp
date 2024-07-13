// index.tsx
import React from 'react';
import Layout from '../../components/Sites/layout'; // Adjust path based on your actual file structure

const IndexPage: React.FC = () => {
  return (
    <Layout>
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard!</h1>
        <p className="text-lg">Select an option from the sidebar to get started.</p>
      </div>
    </Layout>
  );
};

export default IndexPage;
