const express = require('express');
const router = express.Router();
const Warehouse = require('../models/warehouseModel.js');
const Product = require('../models/productModel.js');


router.get('/findwarehouses', async (req, res) => {
  try {
    const warehouses = await Warehouse.find(); // Fetch all warehouses
    res.status(200).json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouses', error: error.message });
  }
});

router.get('/findonewarehouse/:id', async (req, res) => {
  const { id } = req.params; // Get the warehouse ID from the URL parameters

  try {
    const warehouse = await Warehouse.findOne({ _id: id }); // Find the warehouse by ID

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    res.status(200).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouse', error: error.message });
  }
});


router.post('/createwarehouse', async (req, res) => {
    try {
      const { warehouseName, address, geoCoordinates, state} = req.body;
      //console.log(req.body);
      const newWarehouse = new Warehouse({
        warehouseName,
        address,
        geoCoordinates,
        state,
      });
      console.log(newWarehouse);
      await newWarehouse.save();
      res.status(201).json(newWarehouse);
    } catch (error) {
      res.status(400).json({ message: 'Error creating warehouse', error: error.message });
    }
});

router.put('/updatewarehouses/:id', async (req, res) => {
  const { id } = req.params; // Get the warehouse ID from the URL
  const { warehouseName, address, geoCoordinates, state } = req.body; // Get updated data from the request body

  try {
    // Find the warehouse by ID and update it with the new data
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      id,
      { warehouseName, address, geoCoordinates, state },
      { new: true, runValidators: true } // Options: return the updated document and validate
    );

    if (!updatedWarehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    res.status(200).json(updatedWarehouse);
  } catch (error) {
    res.status(400).json({ message: 'Error updating warehouse', error: error.message });
  }
});

router.delete('/deletewarehouses/:id', async (req, res) => {
  const { id } = req.params; // Get the warehouse ID from the URL

  try {
    // Find the warehouse by ID and remove it
    const deletedWarehouse = await Warehouse.findByIdAndDelete(id);

    if (!deletedWarehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    res.status(200).json({ message: 'Warehouse deleted successfully', deletedWarehouse });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting warehouse', error: error.message });
  }
});

router.get('/warehouses/search', async (req, res) => {
    const { longitude, latitude, distance = 50000 } = req.body; // Distance in meters (50 km default)
    // console.log(longitude);
    // console.log(latitude);
  
    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
  
    try {
      const warehouses = await Warehouse.find({
        geoCoordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseFloat(distance), // Distance in meters
          },
        },
      });
  
      res.status(200).json(warehouses);
    } catch (error) {
      res.status(500).json({ message: 'Error searching warehouses', error: error.message });
    }
});

module.exports = router;