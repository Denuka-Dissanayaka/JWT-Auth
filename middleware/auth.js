const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.TOKEN_KEY, (err, payload) => {
            if(err) {
                return res.status(403).send('token is invalid');
            } else {

                req.user = payload;
                next();
            }

        })
    } else {
        res.status(401).send("you are not authenticated");
    }
}

module.exports = verifyToken;