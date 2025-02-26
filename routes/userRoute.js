const express = require('express');
const router = express.Router();
const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {isAuthentication} = require('../middlewares/userauth.js');

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT
    const token = jwt.sign({ email: user.email, userId: user._id }, process.env.SECRET, { expiresIn: '3h' }); // Replace 'your_jwt_secret' with your actual secret

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});


router.post('/purchase', isAuthentication, async (req, res) => {
  const userId = req.user.id;
  //console.log(userId); // Get the user ID from the token
  const { productId, quantity } = req.body; // Assume productId and quantity are sent in the request body

  try {
    const user = await User.findById(userId)
    //console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check the user's purchase permission
    if (user.canPurchase === 'DENIED') {
      return res.status(403).json({ message: 'User not allowed to purchase' });
    } else if (user.canPurchase === 'PENDING') {
      return res.status(403).json({ message: 'User purchase status is pending' });
    } else if (user.canPurchase === 'ALLOWED') {
      // Proceed with the purchase only if allowed
      const product = await Product.findById(productId);
      //console.log(product);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({ message: 'Insufficient product quantity' });
      }

      // Proceed with the purchase
      product.stockQuantity -= quantity; // Decrease the product quantity
      await product.save(); // Save the updated product

      res.status(200).json({ message: 'Purchase successful', product });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing purchase', error: error.message });
  }
});

module.exports = router;
