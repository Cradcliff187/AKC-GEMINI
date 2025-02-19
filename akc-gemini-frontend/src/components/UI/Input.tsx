import React from 'react';

const UserProfileCard = ({ user }) => {
    return (
        <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <img className="w-full h-48 object-cover" src={user.profilePicture} alt={user.name} />
            <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="mt-2 text-gray-500">{user.bio}</p>
                <div className="mt-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                        Follow
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileCard;