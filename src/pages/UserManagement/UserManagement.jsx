import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', surname: '', phone: '', birthDate: '', email: '', password: '', role: 'user' });
    const [editUser, setEditUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [isAddUserVisible, setIsAddUserVisible] = useState(false);

    useEffect(() => {
        const fetchedUsers = [
            { id: 1, name: 'John', surname: 'Doe', phone: '1234567890', birthDate: '1990-01-01', email: 'john.doe@example.com', password: 'password123', role: 'admin' },
            { id: 2, name: 'Jane', surname: 'Smith', phone: '0987654321', birthDate: '1985-05-05', email: 'jane.smith@example.com', password: 'password456', role: 'user' },
        ];
        setUsers(fetchedUsers);
    }, []);

    const filteredUsers = users.filter(user => filter === 'all' || user.role === filter);

    const handleAddUser = () => {
        const newId = users.length + 1;
        setUsers([...users, { ...newUser, id: newId }]);
        setNewUser({ name: '', surname: '', phone: '', birthDate: '', email: '', password: '', role: 'user' });
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

            <button onClick={() => setIsAddUserVisible(!isAddUserVisible)} className="add-user-btn">
                {isAddUserVisible ? 'Cancel' : 'Add User'}
            </button>

            {isAddUserVisible && (
                <div className="user-form-container">
                    <div className="user-form">
                        <h2>{editUser ? 'Edit User' : 'Add New User'}</h2>
                        <input
                            type="text"
                            name="name"
                            value={editUser ? editUser.name : newUser.name}
                            onChange={handleInputChange}
                            placeholder="Name"
                        />
                        <input
                            type="text"
                            name="surname"
                            value={editUser ? editUser.surname : newUser.surname}
                            onChange={handleInputChange}
                            placeholder="Surname"
                        />
                        <input
                            type="text"
                            name="phone"
                            value={editUser ? editUser.phone : newUser.phone}
                            onChange={handleInputChange}
                            placeholder="Phone Number"
                        />
                        <input
                            type="date"
                            name="birthDate"
                            value={editUser ? editUser.birthDate : newUser.birthDate}
                            onChange={handleInputChange}
                            placeholder="Birth Date"
                        />
                        <input
                            type="email"
                            name="email"
                            value={editUser ? editUser.email : newUser.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                        />
                        <input
                            type="password"
                            name="password"
                            value={editUser ? editUser.password : newUser.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                        />
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
                            <th>Name</th>
                            <th>Surname</th>
                            <th>Phone</th>
                            <th>Birth Date</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.surname}</td>
                                <td>{user.phone}</td>
                                <td>{user.birthDate}</td>
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