const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModel.js');
const User = require('../models/userModel.js');
const { proctected } = require('../middlewares/adminauth.js');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({username, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error signing up', error: error.message });
  }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Generate JWT
      const token = jwt.sign({ email: admin.email, adminId: admin._id }, process.env.ADMINSECRET, { expiresIn: '5h' });
  
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});


// Admin Approval API
router.patch('/approve/:userId', proctected, async (req, res) => {
  const adminId = req.admin.id; // Get the admin ID from the token
  // console.log(adminId);
  const userId = req.params.userId; // Get the user ID from the route parameters
  const { approvalStatus } = req.body; // Expecting approval status from the request body (ALLOWED or DENIED)

  // Validate approval status
  if (!['ALLOWED', 'DENIED'].includes(approvalStatus)) {
    return res.status(400).json({ message: 'Invalid approval status. Must be "ALLOWED" or "DENIED".' });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's canPurchase status
    user.canPurchase = approvalStatus;
    await user.save(); // Save the updated user

    res.status(200).json({ message: `User purchase status updated to ${approvalStatus}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user purchase status', error: error.message });
  }
});
  
module.exports = router;
