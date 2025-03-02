const express = require('express');
const path = require('path');
const cors = require('cors');
const stockRoutes = require('./routes/stockRoutes');

const app = express();
const PORT = 4000;

app.use(cors());

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Use stock routes
app.use('/stock', stockRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
