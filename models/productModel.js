const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: true 
  },
  cost: { 
    type: Number, 
    required: true 
  },
  stockQuantity: { 
    type: Number, 
    required: true 
  },
  warehouseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Warehouse', 
    required: true 
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
