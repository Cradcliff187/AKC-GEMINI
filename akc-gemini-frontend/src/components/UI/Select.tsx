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

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Task Manager</h1>
      <form onSubmit={handleAddTask} className="mb-4">
        <input
          type="text"
          value={task}
          onChange={handleInputChange}
          placeholder="Enter a new task"
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Add Task
        </button>
      </form>
      <ul className="list-disc pl-5">
        {tasks.map((t, index) => (
          <li key={index} className="mb-2">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;