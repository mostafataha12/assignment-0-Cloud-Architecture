const User = require('../models/user');
const Habit = require('../models/habit');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.email === 'admin@admin.com') {
        return next();
    }
    req.flash('error', 'You do not have permission to access this page');
    res.redirect('/');
};

// Get admin dashboard with enhanced statistics
const getAdminDashboard = async (req, res) => {
    try {
        // Get all users
        const users = await User.find({}).sort({ createdAt: -1 });
        const totalUsers = users.length;
        
        // Get users who signed in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeUsers = users.filter(user => user.updatedAt >= today);
        
        // Get users with their habit counts
        const usersWithHabits = await User.aggregate([
            {
                $lookup: {
                    from: 'habits',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'habits'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    habitCount: { $size: '$habits' }
                }
            }
        ]);

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            users: usersWithHabits,
            totalUsers,
            activeUsers: activeUsers.length,
            success_msg: req.flash('success'),
            error_msg: req.flash('error')
        });
    } catch (error) {
        console.error('Error in admin dashboard:', error);
        req.flash('error', 'Error loading admin dashboard');
        res.redirect('/');
    }
};

// Search users
const searchUsers = async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const users = await User.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Error searching users' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Don't allow deleting the admin user
        const user = await User.findById(userId);
        if (user.email === 'admin@admin.com') {
            req.flash('error', 'Cannot delete admin user');
            return res.redirect('/admin/dashboard');
        }

        // Delete user's habits first
        await Habit.deleteMany({ user: userId });
        // Then delete the user
        await User.findByIdAndDelete(userId);

        req.flash('success', 'User deleted successfully');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'Error deleting user');
        res.redirect('/admin/dashboard');
    }
};

// Get user details
const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        const habits = await Habit.find({ user: userId });

        res.render('admin/user-details', {
            title: 'User Details',
            user,
            habits,
            success_msg: req.flash('success'),
            error_msg: req.flash('error')
        });
    } catch (error) {
        console.error('Error getting user details:', error);
        req.flash('error', 'Error loading user details');
        res.redirect('/admin/dashboard');
    }
};

module.exports = {
    isAdmin,
    getAdminDashboard,
    searchUsers,
    deleteUser,
    getUserDetails
}; 