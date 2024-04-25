const express = require('express');
const app = express();
const PORT = 5000;
const db = require('./config/db_Setting');
const userRoute = require('./routes/userroutes');

const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());




app.use('/api/v1', userRoute); // Define API routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
