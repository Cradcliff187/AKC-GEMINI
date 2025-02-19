import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
  customers: any[]; // Replace 'any' with your Customer type
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>;
  estimates: any[]; // Replace 'any' with your Estimate type
  setEstimates: React.Dispatch<React.SetStateAction<any[]>>;
  // Add other context values and setters as needed
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [customers, setCustomers] = useState<any[]>([]); // Initial empty array
  const [estimates, setEstimates] = useState<any[]>([]); // Initial empty array

  const value: AppContextType = {
    customers,
    setCustomers,
    estimates,
    setEstimates,
    // Add other context values here
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState([]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setItems([...items, inputValue]);
      setInputValue('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">My Awesome App</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="border border-gray-300 rounded p-2 mr-2"
          placeholder="Type something..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
        >
          Add
        </button>
      </form>
      <ul className="list-disc">
        {items.map((item, index) => (
          <li key={index} className="text-lg mb-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;