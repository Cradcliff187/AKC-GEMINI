import React, { useState } from 'react';

export interface Estimate {
  estimateId: string;
  projectId: string;
  dateCreated?: string;
  customerId: string;
  estimatedAmount?: number;
  contingencyAmount?: number;
  scopeItemsJSON?: string;
  createdBy?: string;
  docUrl?: string;
  docId?: string;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'CLOSED';
  sentDate?: string;
  isActive?: string;
  previousVersionId?: string;
  versionNumber?: string;
  approvedDate?: string;
  approvedBy?: string;
  updatedAmount?: number;
  activeEstimateId?: string;
  currentApprovedAmount?: number;
}

const MyComponent = () => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted with value:', inputValue);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">My Awesome App</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="input">
              Enter Something
            </label>
            <input
              type="text"
              id="input"
              value={inputValue}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Type here..."
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyComponent;