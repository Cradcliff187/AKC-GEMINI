import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Customer, Estimate } from '../types';
import api from '../services/api';

interface AppContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  estimates: Estimate[];
  setEstimates: React.Dispatch<React.SetStateAction<Estimate[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const fetchedCustomers = await api.getCustomers();
      setCustomers(fetchedCustomers);

      const fetchedEstimates = await api.getEstimates();
      setEstimates(fetchedEstimates);
    };

    loadData();
  }, []);

  const value: AppContextType = {
    customers,
    setCustomers,
    estimates,
    setEstimates,
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

const TaskManager = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  const handleInputChange = (e) => {
    setTask(e.target.value);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (task.trim()) {
      setTasks([...tasks, task]);
      setTask('');
    }
  };

  const handleDeleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Task Manager</h1>
      <form onSubmit={handleAddTask} className="flex mb-4">
        <input
          type="text"
          value={task}
          onChange={handleInputChange}
          placeholder="Add a new task"
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition duration-200"
        >
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {tasks.map((task, index) => (
          <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
            <span>{task}</span>
            <button
              onClick={() => handleDeleteTask(index)}
              className="text-red-500 hover:text-red-700 transition duration-200"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;