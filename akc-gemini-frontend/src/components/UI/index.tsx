import React, { useState } from 'react';

const MyComponent = () => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make a backend call
    console.log('Submitted value:', inputValue);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white w-full p-4 text-center">
        <h1 className="text-2xl font-bold">My World-Class UI</h1>
      </header>
      <main className="flex flex-col items-center mt-10">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
          <label className="block mb-2 text-gray-700" htmlFor="inputField">
            Enter Value:
          </label>
          <input
            type="text"
            id="inputField"
            value={inputValue}
            onChange={handleInputChange}
            className="border border-gray-300 p-2 rounded w-full mb-4"
            placeholder="Type something..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
};

export default MyComponent;