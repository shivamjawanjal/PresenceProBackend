const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors');


connectToMongo();
var app = express();

app.use(cors());
const port = process.env.PORT || 5000;

app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/class', require('./routes/class'));
app.use('/api/microproject', require('./routes/microproject'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/upload', require('./routes/uploadRoutes'));  // Updated this line
app.use('/api/uploadurl', require('./routes/googlesheet'));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});