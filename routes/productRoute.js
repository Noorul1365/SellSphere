const express = require('express');
const router = express.Router();
const {isAuthentication} = require('../middlewares/userauth.js');
const {proctected} = require('../middlewares/adminauth.js');
const Warehouse = require('../models/warehouseModel.js');
const Product = require('../models/productModel.js');

router.get('/findproducts', isAuthentication , async (req, res) => {
  try {
    const products = await Product.find().populate('warehouseId');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

router.post('/createproduct',proctected, async (req, res) => {
    try {
      const { itemName, cost, stockQuantity, warehouseId } = req.body;
  
      // Check if the referenced warehouse exists
      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        return res.status(404).json({ message: 'Warehouse not found' });
      }
      const newProduct = new Product({
        itemName,
        cost,
        stockQuantity,
        warehouseId,
      });
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});

router.put('/updateproduct/:id', proctected, async (req, res) => {
  const { id } = req.params; // Get the product ID from the URL
  const { itemName, cost, stockQuantity, warehouseId } = req.body; // Get updated data from the request body

  try {
    // Find the product by ID and update it with the new data
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { itemName, cost, stockQuantity, warehouseId },
      { new: true, runValidators: true } // Options: return the updated document and validate
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

router.delete('/deleteproduct/:id',proctected, async (req, res) => {
  const { id } = req.params; // Get the product ID from the URL

  try {
    // Find the product by ID and remove it
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// router.get('/products/nearby', async (req, res) => {
//   const { latitude, longitude } = req.body;

//   // Validate input
//   if (!latitude || !longitude) {
//       return res.status(400).json({ message: 'Latitude and longitude are required' });
//   }

//   try {
//       // Find warehouses within 50 km
//       const warehouses = await Warehouse.find({
//           geoCoordinates: {
//               $near: {
//                   $geometry: {
//                       type: 'Point',
//                       coordinates: [parseFloat(longitude), parseFloat(latitude)], // [longitude, latitude]
//                   },
//                   $maxDistance: 50000, // 50 km in meters
//               },
//           },
//       });

//       // Extract warehouse IDs
//       const warehouseIds = warehouses.map(warehouse => warehouse._id);

//       // Find products associated with these warehouses
//       const products = await Product.find({ warehouseId: { $in: warehouseIds } }).populate('warehouseId');

//       return res.status(200).json(products);
//   } catch (error) {
//       console.error('Error fetching nearby products:', error);
//       return res.status(500).json({ message: 'Error fetching products', error: error.message });
//   }
// });

router.get('/products/nearby', async (req, res) => {
  const { latitude, longitude } = req.body;

  // Validate input
  if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
      // First, find warehouses within 50 km
      const warehouses = await Warehouse.aggregate([
          {  
              $geoNear: {
                  near: {
                      type: 'Point',
                      coordinates: [parseFloat(longitude), parseFloat(latitude)], // [longitude, latitude]
                  },
                  distanceField: 'distance', // Field to store the distance
                  maxDistance: 50000, // 50 km in meters
                  spherical: true,
                  query: { 'geoCoordinates': { $exists: true } } // Ensure the warehouse has geoCoordinates
              }
          }
      ]);

      // Extract warehouse IDs
      const warehouseIds = warehouses.map(warehouse => warehouse._id);

      // Find products associated with these warehouses
      const products = await Product.find({ warehouseId: { $in: warehouseIds } }).populate('warehouseId');

      return res.status(200).json(products);
  } catch (error) {
      console.error('Error fetching nearby products:', error);
      return res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

module.exports = router;
