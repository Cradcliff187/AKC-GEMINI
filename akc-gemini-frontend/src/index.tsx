import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './context/AppContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

const UserProfileCard = ({ user }) => {
  return (
    <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <img className="w-full h-48 object-cover" src={user.profilePicture} alt={user.name} />
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-600">{user.bio}</p>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">
          Follow
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard;