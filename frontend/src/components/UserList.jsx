import { useState, useEffect } from 'react';
import api from '../api/axios';

function UserList({ selectedUser, onSelectUser, onlineUsers }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="user-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/30 transition-all duration-200"
          />
        </div>
      </div>

      {/* Online count */}
      <div className="px-4 pb-2">
        <p className="text-xs font-medium text-dark-500 uppercase tracking-wider">
          Online — {onlineUsers.length}
        </p>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto px-2">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <svg className="animate-spin w-6 h-6 text-primary-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-dark-500 text-sm">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user);
            const isSelected = selectedUser === user;

            return (
              <button
                key={user}
                id={`user-item-${user}`}
                onClick={() => onSelectUser(user)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all duration-200 group ${
                  isSelected
                    ? 'bg-primary-600/20 border border-primary-500/30'
                    : 'hover:bg-dark-800/50 border border-transparent'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                      : 'bg-gradient-to-br from-dark-500 to-dark-600 group-hover:from-primary-500 group-hover:to-primary-700'
                  }`}>
                    {user.charAt(0).toUpperCase()}
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-dark-900 rounded-full online-pulse" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isSelected ? 'text-primary-200' : 'text-dark-200 group-hover:text-dark-100'
                  }`}>
                    {user}
                  </p>
                  <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-dark-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UserList;
