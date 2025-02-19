import React from 'react';
import { useAppContext } from '../../context/AppContext';

// Sample data structure based on your backend blueprint
const sampleData = [
  { id: 1, name: 'Item One', description: 'Description for item one' },
  { id: 2, name: 'Item Two', description: 'Description for item two' },
  { id: 3, name: 'Item Three', description: 'Description for item three' },
];

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-6 w-96">
        <h1 className="text-2xl font-bold text-center mb-4">My Awesome App</h1>
        <ul className="space-y-4">
          {sampleData.map(item => (
            <li key={item.id} className="bg-gray-50 p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-600">{item.description}</p>
            </li>
          ))}
        </ul>
        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">
          Action Button
        </button>
      </div>
    </div>
  );
};

const CustomerList = () => {
  const { customers } = useAppContext();

  return (
    <div className="shadow-md rounded my-4">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Name
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Email
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customerId}>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {customer.name}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {customer.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
export { CustomerList };