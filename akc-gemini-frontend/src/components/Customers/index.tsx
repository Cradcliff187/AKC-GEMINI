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
      <h1 className="text-3xl font-bold mb-4">Welcome to My App</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="inputField">
          Enter something:
        </label>
        <input
          type="text"
          id="inputField"
          value={inputValue}
          onChange={handleInputChange}
          className="block w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Type here..."
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 transition duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default MyComponent;