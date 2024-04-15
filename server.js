const express = require('express');
const app = express();
const PORT = 5000;
const db = require('./config/db_Setting');
const userRoute = require('./routes/userroutes');

const cors = require('cors');
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin : true, // change to false if you want to enable CORS for a specific origin
}));
app.use(express.json());



app.use('/api/v1', userRoute); // Define API routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
