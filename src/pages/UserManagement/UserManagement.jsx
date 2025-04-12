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
        role: '',
        isVerified: false,
        verificationToken: generateRandomToken(), // Generate default token
        resetToken: generateRandomToken(), // Generate default token
    });
    const [editUser, setEditUser] = useState(null);
    const [filter, setFilter] = useState('Staff');
    const [isAddUserVisible, setIsAddUserVisible] = useState(false);
    const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [originalUser, setOriginalUser] = useState({});
    // Filtriranje korisnika prema filteru
    const filteredUsers = users.filter(user => user.role === filter);

    // Base URL for API calls
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const isNameValid = (name) => /^[A-Za-zČčĆćŽžŠšĐđ]+$/.test(name);

    const isEmailValid = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isUsernameUnique = async (username, userType, currentUserId) => {
        const response = await fetch(`${API_BASE_URL}/${userType === 'customers' ? 'Customer' : 'User'}`);
        const users = await response.json();

        return !users.some(user => user.username === username && user.id !== currentUserId);
    };

    const isEmailUnique = async (email, userType, currentUserId) => {
        const response = await fetch(`${API_BASE_URL}/${userType === 'customers' ? 'Customer' : 'User'}`);
        const users = await response.json();

        return !users.some(user => user.email === email && user.id !== currentUserId);
    };

    // Helper function to generate random tokens
    function generateRandomToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Prepare user object for API requests
    const prepareUserForApi = (user, isNew = false) => {
        const preparedUser = { ...user };

        // Convert role string to enum value (0: Admin, 1: Employee)
        if (typeof preparedUser.role === 'string') {
            preparedUser.role = preparedUser.role === 'Admin' ? 0 : 1; // Only Admin and Employee
        }

        // For new users, ensure required fields have values
        if (isNew) {
            preparedUser.passwordHash = preparedUser.password;
            delete preparedUser.password;

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
            uiUser.role = uiUser.role === 0 ? 'Admin' : 'Employee';
        }

        return uiUser;
    };

    // Function to fetch users based on filter
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = API_BASE_URL;

            if (filter === 'Staff') {
                const [adminsResponse, employeesResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/User/admins`),
                    fetch(`${API_BASE_URL}/User/employees`)
                ]);

                if (!adminsResponse.ok || !employeesResponse.ok) {
                    throw new Error('Error fetching staff data');
                }

                const [admins, employees] = await Promise.all([
                    adminsResponse.json(),
                    employeesResponse.json()
                ]);

                setUsers([...admins, ...employees].map(user => prepareUserForUI(user)));
                return;
            } else if (filter === 'Customer') {
                url = `${API_BASE_URL}/Customer`; // Ispravna ruta
            }


            // Add pagination parameters
            url += `?pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            setUsers(data.map(user => prepareUserForUI(user)));
        } catch (err) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load users on component mount and when filter or pagination changes
    useEffect(() => {
        setEditUser(null);
        fetchUsers();
    }, [filter, pagination.pageNumber, pagination.pageSize]);

    // Handle pagination changes
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, pageNumber: newPage }));
    };

    // Add a new user
    const handleAddUser = async () => {
        setLoading(true);
        setError(null);

        const { firstName, lastName, username, email, password, role } = newUser;

        const userType = role === 'Customer' ? 'customers' : 'users';

        if (!isNameValid(firstName) || !isNameValid(lastName)) {
            window.alert("First and last name can only contain letters.");
            setLoading(false);
            return;
        }

        if (!firstName || !lastName || !username || !email || !password || !role) {
            window.alert("All fields must be filled.");
            setLoading(false);
            return;
        }

        if (!isEmailValid(email)) {
            window.alert("Invalid email format.");
            setLoading(false);
            return;
        }

        const usernameUnique = await isUsernameUnique(username, userType);
        const emailUnique = await isEmailUnique(email, userType);

        if (!usernameUnique) {
            window.alert("Username already exists.");
            setLoading(false);
            return;
        }

        if (!emailUnique) {
            window.alert("Email already exists.");
            setLoading(false);
            return;
        }

        try {
            const userType = newUser.role === 'Customer' ? 'customers' : 'users';

            const apiEndpoint = userType === 'users' ? `${API_BASE_URL}/User` : `${API_BASE_URL}/Customer`;

            const userToAdd = prepareUserForApi(newUser, true); // Drugi parametar 'true' znači da je novi korisnik

            if (userType === 'customers') {
                delete userToAdd.role; // No role for customer
                userToAdd.password = userToAdd.passwordHash;
                delete userToAdd.passwordHash;
            }

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userToAdd)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            fetchUsers();

            setNewUser({
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                role: '',
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

        // Determine the API route based on the type (User or Customer)
        const apiUrl = filter === 'Customer' ? `/Customer/${id}` : `/User/${id}`;

        try {
            const response = await fetch(`${API_BASE_URL}${apiUrl}`, {
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

        const apiEndpoint = filter === 'Customer'
            ? `${API_BASE_URL}/Customer/${user.id}`  
            : `${API_BASE_URL}/User/${user.id}`;    

        try {
            const response = await fetch(apiEndpoint);

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const userData = await response.json();

            setEditUser(prepareUserForUI(userData));
            setOriginalUser({ username: userData.username, email: userData.email }); 
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

        const { firstName, lastName, username, email } = editUser;
        const userType = filter === 'Customer' ? 'customers' : 'users';

        if (!isNameValid(firstName) || !isNameValid(lastName)) {
            window.alert("First and last name can only contain letters.");
            setLoading(false);
            return;
        }

        if (!isEmailValid(email)) {
            window.alert("Invalid email format.");
            setLoading(false);
            return;
        }

        if (username !== originalUser.username) {
            const usernameUnique = await isUsernameUnique(username, userType, editUser.id);
            if (!usernameUnique) {
                window.alert("Username already exists.");
                setLoading(false);
                return;
            }
        }

        if (email !== originalUser.email) {
            const emailUnique = await isEmailUnique(email, userType, editUser.id);
            if (!emailUnique) {
                window.alert("Email already exists.");
                setLoading(false);
                return;
            }
        }


        try {
            // Prepare user/customer with proper role format for API
            const userToUpdate = prepareUserForApi(editUser);
            userToUpdate.ResetToken = generateRandomToken();
            userToUpdate.VerificationToken = generateRandomToken() || null;

            // Check if user is a customer or user (staff)
            if (filter === 'Customer') {
                // For Customer, send 'password' instead of 'passwordHash'
                userToUpdate.password = userToUpdate.passwordHash;
                delete userToUpdate.passwordHash;
            }

            // Determine the correct API endpoint based on the role
            const endpoint = filter === 'Customer'
                ? `${API_BASE_URL}/Customer/${editUser.id}` 
                : `${API_BASE_URL}/User/${editUser.id}`;  

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userToUpdate)
            });

            if (!response.ok) {
                throw new Error(`Error updating user: ${response.statusText}`);
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
            {error && <div className="error-message">Error: {error}</div>}

            <div className="filter-buttons">
                <button onClick={() => setFilter('Staff')} className={filter === 'Staff' ? 'active' : ''}>
                    Staff
                </button>
                <button onClick={() => setFilter('Customer')} className={filter === 'Customer' ? 'active' : ''}>
                    Customers
                </button>
            </div>

            <button
                onClick={() => {
                    // Ako je forma vidljiva, sakrij je, inače je prikaži
                    setIsAddUserVisible(!isAddUserVisible);

                    // Ako se forma zatvara, resetuj podatke korisnika za uređivanje
                    if (isAddUserVisible) {
                        setEditUser(null);
                    }
                }}
                className="add-user-btn"
            >
                {isAddUserVisible ? 'Cancel' : '+ Add New User'}
            </button>

            {isAddUserVisible && (
                <div className="user-form-container" key={editUser ? editUser.id : newUser.id}>
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
                            <option value="" disabled>Select Role</option>
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
                <h2>{filter === 'Staff' ? 'Staff List' : filter === 'Customer' ? 'Customers List' : 'Staff List'}</h2>
                
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
                                    {/* Uklonite Role kolonu ako je filter 'Customer' */}
                                    {filter !== 'Customer' && <th>Role</th>}
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
                                        {/* Prikazivanje Role samo ako nije 'Customer' */}
                                        {filter !== 'Customer' && <td>{user.role}</td>}
                                        <td>{user.isVerified ? 'Yes' : 'No'}</td>
                                        <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleEditUser(user)} 
                                                className="edit-btn"
                                                disabled={loading}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)} 
                                                className="delete-btn"
                                                disabled={loading}
                                            >
                                                <i className="fas fa-trash-alt"></i>
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
                                    disabled={filteredUsers.length < pagination.pageSize || loading}
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