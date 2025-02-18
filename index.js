const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors');

connectToMongo();
var app = express();

// Enable CORS for localhost:3000
const corsOptions = {
    origin: "https://presence-pro-front-end2.vercel.app",  // Allow requests from this domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow specific methods
    credentials: true,  // If you need to send cookies or authentication headers
};

app.use(cors(corsOptions));  // Apply CORS middleware with options

const port = process.env.PORT || 5000;

app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/class', require('./routes/class'));
app.use('/api/microproject', require('./routes/microproject'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/upload', require('./routes/uploadRoutes'));  
app.use('/api/uploadurl', require('./routes/googlesheet'));

// Root route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
