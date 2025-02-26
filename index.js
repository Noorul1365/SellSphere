const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');

const warehouseRoute = require('./routes/warehouseRoute.js');
const productRoute = require('./routes/productRoute.js');
const userRoute = require('./routes/userRoute.js');
const adminRoute = require('./routes/adminRoute.js');

require('./db/dbconnection.js');

// Middleware
app.use(express.json());
app.use(cookieParser());

// Sample route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use("/api/warehouse", warehouseRoute);
app.use("/api/product", productRoute);
app.use("/api/user/", userRoute);
app.use("/api/admin/", adminRoute);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});