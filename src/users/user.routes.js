const express = require('express');
const { userRegistration, userLoggedIn, userlogout, getAllUsers, deleteUser, updateUserRole, editUserProfile } = require('./user.controller');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

// Example route: Change this to match your actual logic
router.post('/register', userRegistration);

// THIS IS THE CRITICAL LINE
// login route
router.post('/login', userLoggedIn)

// post method
router.post("/logout", userlogout)

// get all endpoints (token verify and admin for access)
router.get('/users', verifyToken, verifyAdmin, getAllUsers)

// delete route only admin
router.delete('/users/:id', verifyToken, verifyAdmin, deleteUser)

// update user role by admin
router.put('/users/:id', verifyToken, verifyAdmin, updateUserRole)

// edit user role by admin
router.patch('/edit-profile/:id', verifyToken, editUserProfile)


module.exports = router;