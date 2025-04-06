import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', username: '', email: '', password: '', role: 'user' });
    const [editUser, setEditUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [isAddUserVisible, setIsAddUserVisible] = useState(false);

    useEffect(() => {
        const fetchedUsers = [
            { id: 1, firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john.doe@example.com', role: 'admin' },
            { id: 2, firstName: 'Jane', lastName: 'Smith', username: 'janesmith', email: 'jane.smith@example.com', role: 'user' },
        ];
        setUsers(fetchedUsers);
    }, []);

    const filteredUsers = users.filter(user => filter === 'all' || user.role === filter);

    const handleAddUser = () => {
        const newId = users.length + 1;
        setUsers([...users, { ...newUser, id: newId }]);
        setNewUser({ firstName: '', lastName: '', username: '', email: '', password: '', role: 'user' });
        setIsAddUserVisible(false);
    };

    const handleDeleteUser = (id) => {
        setUsers(users.filter(user => user.id !== id));
    };

    const handleEditUser = (user) => {
        setEditUser({ ...user });
        setIsAddUserVisible(true);
    };

    const handleSaveEdit = () => {
        setUsers(users.map(user => user.id === editUser.id ? editUser : user));
        setEditUser(null);
        setIsAddUserVisible(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editUser) {
            setEditUser(prev => ({ ...prev, [name]: value }));
        } else {
            setNewUser(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div className="user-management">
            <div className="filter-buttons">
                <button onClick={() => setFilter('admin')}>Admins</button>
                <button onClick={() => setFilter('user')}>Users</button>
                <button onClick={() => setFilter('all')}>All</button>
            </div>

            <button onClick={() => {
                setIsAddUserVisible(!isAddUserVisible);
                setEditUser(null);
            }} className="add-user-btn">
                {isAddUserVisible ? 'Cancel' : 'Add User'}
            </button>

            {isAddUserVisible && (
                <div className="user-form-container">
                    <div className="user-form">
                        <h2>{editUser ? 'Edit User' : 'Add New User'}</h2>
                        <input
                            type="text"
                            name="firstName"
                            value={editUser ? editUser.firstName : newUser.firstName}
                            onChange={handleInputChange}
                            placeholder="First Name"
                        />
                        <input
                            type="text"
                            name="lastName"
                            value={editUser ? editUser.lastName : newUser.lastName}
                            onChange={handleInputChange}
                            placeholder="Last Name"
                        />
                        <input
                            type="text"
                            name="username"
                            value={editUser ? editUser.username : newUser.username}
                            onChange={handleInputChange}
                            placeholder="Username"
                        />
                        <input
                            type="email"
                            name="email"
                            value={editUser ? editUser.email : newUser.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                        />
                        {!editUser && (
                            <input
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleInputChange}
                                placeholder="Password"
                            />
                        )}
                        <select
                            name="role"
                            value={editUser ? editUser.role : newUser.role}
                            onChange={handleInputChange}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button onClick={editUser ? handleSaveEdit : handleAddUser} className="add-btn">
                            {editUser ? 'Save Changes' : 'Add User'}
                        </button>
                    </div>
                </div>
            )}

            <div className="user-list">
                <h2>Users List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button onClick={() => handleEditUser(user)} className="edit-btn">Edit</button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;