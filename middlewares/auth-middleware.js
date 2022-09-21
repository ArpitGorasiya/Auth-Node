const jwt = require('jsonwebtoken')
const UserModel = require('../models/User')

var checkUserAuth = async (req, res, next) => {
    let token
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = authorization.split(' ')[1]
            // console.log("Token", token)
            // console.log("Authorization", authorization)
            const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            // console.log(userId);
            req.user = await UserModel.findById(userId).select('-password')
            next()
        } catch (error) {
            console.log(error)
            res.status(400).send({ "status": "failed", "msg": "Unauthorized User" })
        }
    }
    if (!token) {
        res.status(400).send({ "status": "failed", "msg": "Unauthorized User, No Token" })
    }
}

module.exports = checkUserAuth