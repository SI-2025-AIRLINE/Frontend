import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '', // Will be converted to passwordHash on server
        role: 'Customer',
        isVerified: false,
        verificationToken: generateRandomToken(), // Generate default token
        resetToken: generateRandomToken(), // Generate default token
    });
    const [editUser, setEditUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [isAddUserVisible, setIsAddUserVisible] = useState(false);
    const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Base URL for API calls
    const API_BASE_URL = 'https://si-airline.azurewebsites.net/api/User';

    // Helper function to generate random tokens
    function generateRandomToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Prepare user object for API requests
    const prepareUserForApi = (user, isNew = false) => {
        const preparedUser = { ...user };
        
        // Convert role string to enum value (0: Admin, 1: Employee, 2: Customer)
        if (typeof preparedUser.role === 'string') {
            switch(preparedUser.role) {
                case 'Admin': preparedUser.role = 0; break;
                case 'Employee': preparedUser.role = 1; break;
                case 'Customer': 
                default: preparedUser.role = 2;
            }
        }
        
        // For new users, ensure required fields have values
        if (isNew) {
            // Password will be hashed on the server
            preparedUser.passwordHash = preparedUser.password;
            delete preparedUser.password;
            
            // Set defaults for required fields if not present
            if (!preparedUser.isVerified) preparedUser.isVerified = false;
            if (!preparedUser.verificationToken) preparedUser.verificationToken = generateRandomToken();
            if (!preparedUser.resetToken) preparedUser.resetToken = generateRandomToken();
        }
        
        return preparedUser;
    };

    // Convert API user object to format for UI
    const prepareUserForUI = (apiUser) => {
        const uiUser = { ...apiUser };
        
        // Convert role enum to string for display
        if (typeof uiUser.role === 'number') {
            switch(uiUser.role) {
                case 0: uiUser.role = 'Admin'; break;
                case 1: uiUser.role = 'Employee'; break;
                case 2: uiUser.role = 'Customer'; break;
                default: uiUser.role = 'Customer';
            }
        }
        
        return uiUser;
    };

    // Function to fetch users based on filter
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = API_BASE_URL;
            
            // Use role-specific endpoints if filtering
            if (filter === 'Admin') {
                url = `${API_BASE_URL}/admins`;
            } else if (filter === 'Customer') {
                url = `${API_BASE_URL}/customers`;
            }
            
            // Add pagination parameters
            url += `?pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            // Convert roles to strings for UI
            const processedData = data.map(user => prepareUserForUI(user));
            setUsers(processedData);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load users on component mount and when filter or pagination changes
    useEffect(() => {
        fetchUsers();
    }, [filter, pagination.pageNumber, pagination.pageSize]);

    // Handle pagination changes
    const handlePageChange = (newPage) => {
        setPagination({...pagination, pageNumber: newPage});
    };

    // Add a new user
    const handleAddUser = async () => {
        setLoading(true);
        setError(null);
        try {
            // Prepare user object with all required fields
            const userToAdd = prepareUserForApi(newUser, true);
            
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userToAdd)
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            
            // Refresh the user list after adding
            fetchUsers();
            
            // Reset form and close it
            setNewUser({
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                role: 'Customer',
                isVerified: false,
                verificationToken: generateRandomToken(),
                resetToken: generateRandomToken(),
            });
            setIsAddUserVisible(false);
        } catch (err) {
            setError(err.message);
            console.error('Error adding user:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete a user
    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            
            // Refresh the user list after deletion
            fetchUsers();
        } catch (err) {
            setError(err.message);
            console.error('Error deleting user:', err);
        } finally {
            setLoading(false);
        }
    };

    // Set up edit user form
    const handleEditUser = async (user) => {
        setLoading(true);
        setError(null);
        try {
            // Get the latest user data
            const response = await fetch(`${API_BASE_URL}/${user.id}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            
            const userData = await response.json();
            // Convert to UI format
            setEditUser(prepareUserForUI(userData));
            setIsAddUserVisible(true);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching user details:', err);
        } finally {
            setLoading(false);
        }
    };

    // Save edited user
    const handleSaveEdit = async () => {
        setLoading(true);
        setError(null);
        try {
            // Prepare user with proper role format for API
            const userToUpdate = prepareUserForApi(editUser);
            userToUpdate.ResetToken = generateRandomToken(); 
            userToUpdate.VerificationToken = generateRandomToken() || null; 
            
            const response = await fetch(`${API_BASE_URL}/${editUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userToUpdate)
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            
            // Refresh the user list
            fetchUsers();
            
            // Close the form
            setEditUser(null);
            setIsAddUserVisible(false);
        } catch (err) {
            setError(err.message);
            console.error('Error updating user:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
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
            <h1>User Management</h1>
            
            {error && <div className="error-message">Error: {error}</div>}

            <div className="filter-buttons">
                <button onClick={() => setFilter('Admin')} className={filter === 'Admin' ? 'active' : ''}>Admins</button>
                <button onClick={() => setFilter('Employee')} className={filter === 'Employee' ? 'active' : ''}>Employees</button>
                <button onClick={() => setFilter('Customer')} className={filter === 'Customer' ? 'active' : ''}>Customers</button>
                <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
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
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            value={editUser ? editUser.lastName : newUser.lastName}
                            onChange={handleInputChange}
                            placeholder="Last Name"
                            required
                        />
                        <input
                            type="text"
                            name="username"
                            value={editUser ? editUser.username : newUser.username}
                            onChange={handleInputChange}
                            placeholder="Username"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={editUser ? editUser.email : newUser.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            required
                        />
                        {!editUser && (
                            <input
                                type="password"
                                name="password"
                                value={newUser.password}
                                onChange={handleInputChange}
                                placeholder="Password"
                                required
                            />
                        )}
                        <select
                            name="role"
                            value={editUser ? editUser.role : newUser.role}
                            onChange={handleInputChange}
                        >
                            <option value="Customer">Customer</option>
                            <option value="Employee">Employee</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="isVerified"
                                name="isVerified"
                                checked={editUser ? editUser.isVerified : newUser.isVerified}
                                onChange={(e) => {
                                    const value = e.target.checked;
                                    if (editUser) {
                                        setEditUser(prev => ({ ...prev, isVerified: value }));
                                    } else {
                                        setNewUser(prev => ({ ...prev, isVerified: value }));
                                    }
                                }}
                            />
                            <label htmlFor="isVerified">Verified User</label>
                        </div>
                        <button 
                            onClick={editUser ? handleSaveEdit : handleAddUser} 
                            className="add-btn"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (editUser ? 'Save Changes' : 'Add User')}
                        </button>
                    </div>
                </div>
            )}

            <div className="user-list">
                <h2>Users List</h2>
                
                {loading && !isAddUserVisible && <div className="loading">Loading users...</div>}
                
                {users.length === 0 && !loading ? (
                    <p>No users found</p>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Verified</th>
                                    <th>Last Login</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.firstName}</td>
                                        <td>{user.lastName}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>{user.isVerified ? 'Yes' : 'No'}</td>
                                        <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleEditUser(user)} 
                                                className="edit-btn"
                                                disabled={loading}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)} 
                                                className="delete-btn"
                                                disabled={loading}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="pagination">
                            <button 
                                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                disabled={pagination.pageNumber === 1 || loading}
                            >
                                Previous
                            </button>
                            <span>Page {pagination.pageNumber}</span>
                            <button 
                                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                disabled={users.length < pagination.pageSize || loading}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserManagement;