const express = require('express');
const app = express();
const PORT = 5000;
const db = require('./config/db_Setting');
const userRoute = require('./routes/userroutes');
const adminroute=require('./routes/adminroute')
const route = require('./routes/index');

const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use('/api',route);

app.use('/api/v1', userRoute); // Define API routes
app.use('/v2',adminroute)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
