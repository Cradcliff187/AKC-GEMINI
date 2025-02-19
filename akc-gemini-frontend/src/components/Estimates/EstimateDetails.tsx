import React from 'react';

const UserProfileCard = ({ user }) => {
  return (
    <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex items-center justify-center h-48 bg-gray-200">
        <img
          className="w-24 h-24 rounded-full border-4 border-white"
          src={user.avatar}
          alt={user.name}
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        <p className="mt-2 text-gray-500">{user.bio}</p>
      </div>
      <div className="flex justify-between p-4 bg-gray-100">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Follow
        </button>
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
          Message
        </button>
      </div>
    </div>
  );
};

// Example usage
const App = () => {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Software Developer at XYZ Company',
    avatar: 'https://via.placeholder.com/150',
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <UserProfileCard user={user} />
    </div>
  );
};

export default App;