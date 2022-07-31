const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const route = express.Router();

const User = require('../model/user');
const verify = require('../middleware/auth');

route.post('/register', async (req, res) => {
    try {
        const {first_name, last_name, email, password} = req.body;

        // validate user inputs
        if(!(first_name && last_name && email && password)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        const checkUser = await User.findOne({email});
        checkUser && res.status(409).send("User Already Exist. Please Login");

        //Encrypt user password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // create new user
        const newUser = new User({
            first_name,
            last_name,
            email,
            password: encryptedPassword
        })

        // save new user into database 
        const user = await newUser.save();
        res.status(201).json(user);

    } catch(err) {
        console.log(err.message);
    }
})

const generateAccessToken = (user) => {
    return jwt.sign({ userid: user._id || user.userid, isAdmin: user.isAdmin }, process.env.TOKEN_KEY, { expiresIn: "1m" });
}

const generateRefreshToken = (user) => {
    return jwt.sign({ userid: user._id || user.userid, isAdmin: user.isAdmin }, process.env.TOKEN_KEY_REFRESH );
}

route.post('/refresh', async (req, res) => {
    //take the refresh token from the user
    const refreshToken = req.body.token;

    //send error if there is no token or it's ínvalid
    if(!refreshToken) return res.status(401).send('you are not authenticated');
    const user = await User.findById(req.body.userId);
    console.log(user)
    if(user.refreshToken !== refreshToken) {
        console.log('hello 1');
        return res.status(403).send('refresh token is invalid...');
    }
    console.log('hello 2');
    jwt.verify(refreshToken, process.env.TOKEN_KEY_REFRESH, async (err, payload) => {
        err && console.log(err.message);
        console.log(payload)
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);
        user.refreshToken = newRefreshToken;
        await User.findByIdAndUpdate(req.body.userId, user, {new: true});
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })
    })

    //if everything is ok, create new access token, refresh token and send to user
})

route.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate inputs
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }

        // find user
        const user = await User.findOne({ email });


        if (user && await bcrypt.compare(password, user.password)) {
            // create token
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            user.token = accessToken;
            user.refreshToken = refreshToken;
            await User.findByIdAndUpdate(user._id, user, {new: true})
            res.status(200).json(user);
        } else {
            res.status(400).send("email or password incorrect...")
        }

    } catch (err) {
        console.log(err.message);
    }

})

route.get('/dashboard', verify, (req, res) => {
    res.status(200).send('dashboard');
} )

route.delete('/users/:userId', verify, (req, res) => {
    if(req.user.userid === req.params.userId || req.user.isAdmin) {
        res.status(200).send('user has been deleted')
    } else {
        res.status(403).send('Your not allowed to deleted this user...')
    }
})



module.exports = route