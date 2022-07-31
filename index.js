const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const userRoute = require('./routes/user')

dotenv.config();

mongoose.connect(process.env.BATABASE_URL)
    .then(() => console.log('database connected'))
    .catch(err => console.log(err.message))

const app = express();
app.use(express.json());

app.use('/api', userRoute )



app.listen(5000, () => {
    console.log('server started')
})