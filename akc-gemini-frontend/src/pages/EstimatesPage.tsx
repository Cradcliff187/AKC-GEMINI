<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Tailwind UI</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/prop-types/prop-types.min.js"></script>
</head>
<body class="bg-gray-100">
    <div id="root"></div>
    <script>
        const { useState } = React;

        const App = () => {
            const [inputValue, setInputValue] = useState('');

            const handleChange = (e) => {
                setInputValue(e.target.value);
            };

            const handleSubmit = (e) => {
                e.preventDefault();
                alert(`Submitted: ${inputValue}`);
                setInputValue('');
            };

            return (
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-3xl font-bold mb-4">Welcome to My App</h1>
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Input:</label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleChange}
                            className="border border-gray-300 rounded p-2 mb-4 w-full"
                            placeholder="Type something..."
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

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>

import React from 'react';
import EstimateList from '../components/Estimates/EstimateList';

const EstimatesPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Estimates</h1>
      <EstimateList />
    </div>
  );
};

export default EstimatesPage;