import React from 'react';
import CustomerList from '../components/Customers/CustomerList';

const CustomersPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Customers</h1>
      <CustomerList />
    </div>
  );
};

export default CustomersPage;