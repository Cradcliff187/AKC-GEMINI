import React, { useState } from 'react';

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
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>
      <form onSubmit={handleAddTask} className="mb-4">
        <input
          type="text"
          value={task}
          onChange={handleInputChange}
          placeholder="Enter a new task"
          className="border border-gray-300 rounded-lg p-2 w-full mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-lg p-2 w-full hover:bg-blue-600"
        >
          Add Task
        </button>
      </form>
      <ul className="list-disc pl-5">
        {tasks.map((task, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <span>{task}</span>
            <button
              onClick={() => handleDeleteTask(index)}
              className="text-red-500 hover:text-red-700"
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

// filepath: ./akc-gemini-frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        light: '#f8f9fa',
        dark: '#343a40',
      },
    },
  },
  plugins: [],
}