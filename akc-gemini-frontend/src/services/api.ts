import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Ensure you have Tailwind CSS imported here
import { Customer, Estimate } from '../types';
import { customers as mockCustomers, estimates as mockEstimates } from './data';

// Simulate API calls with Promises and setTimeout
const api = {
  getCustomers: (): Promise<Customer[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCustomers);
      }, 500); // Simulate network latency
    });
  },
  getEstimates: (): Promise<Estimate[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockEstimates);
      }, 500); // Simulate network latency
    });
  },
};

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
      </header>
      <main className="flex-grow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Card 1" content="This is the content for card 1." />
          <Card title="Card 2" content="This is the content for card 2." />
          <Card title="Card 3" content="This is the content for card 3." />
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2023 My Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

const Card = ({ title, content }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="font-semibold text-lg">{title}</h2>
      <p className="text-gray-700">{content}</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

export default api;