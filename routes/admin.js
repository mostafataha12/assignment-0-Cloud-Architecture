const express = require('express');
const router = express.Router();
const { isAdmin, getAdminDashboard, searchUsers, deleteUser, getUserDetails } = require('../controllers/admin');

// Admin root path - redirect to dashboard
router.get('/', (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Please sign in to access admin panel');
        return res.redirect('/users/sign-in');
    }
    if (req.user.email !== 'admin@admin.com') {
        req.flash('error', 'You do not have permission to access admin panel');
        return res.redirect('/habits/dashboard');
    }
    res.redirect('/admin/dashboard');
});

// Admin dashboard route
router.get('/dashboard', isAdmin, getAdminDashboard);

// Search users
router.get('/search', isAdmin, searchUsers);

// Delete user
router.delete('/users/:id', isAdmin, deleteUser);

// Get user details
router.get('/users/:id', isAdmin, getUserDetails);

module.exports = router; 