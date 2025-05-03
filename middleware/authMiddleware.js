const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const protect = asyncHandler(async (req, res, next) =>
{
    let token = req.cookies.token;

    if(!token)
    {
        return res.status(401).json({message:'not authorized, no token'})
    }

        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id).select('-password')
            next()
        }
        catch(error)
        {
            return res.status(401).json({message:'not authorized, invalid token'})
        }
})

module.exports = {protect}