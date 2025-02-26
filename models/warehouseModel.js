const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  warehouseName: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  geoCoordinates: {
    type: {
      type: String, // 'Point' for geospatial
      enum: ['Point'],
      required: true
    },
    coordinates: { 
      type: [Number], // [longitude, latitude]
      required: true 
    }
  },
  state: { 
    type: String, 
    required: true 
  },
});

// Create a geospatial index on geoCoordinates
warehouseSchema.index({ geoCoordinates: '2dsphere' });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
