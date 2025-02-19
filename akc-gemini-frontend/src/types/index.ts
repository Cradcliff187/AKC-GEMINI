import React, { useState } from 'react';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white w-full p-4 text-center">
        <h1 className="text-2xl font-bold">My World-Class UI</h1>
      </header>
      <main className="flex flex-col items-center mt-10">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <label className="block mb-4">
            <span className="text-gray-700">Input:</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              placeholder="Type something..."
            />
          </label>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
};

export * from './customer';
export * from './estimate';

export default MyComponent;