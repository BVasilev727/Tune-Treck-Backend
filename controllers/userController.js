const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/userModel')
const verifyEmail = require('../utils/verifyEmail')

const registerUser = asyncHandler(async (req, res) =>
{
    const {name, email, password} = req.body

    if(!name || !email || ! password)
    {
        res.status(400)
        throw Error('All fields must be filled')
    }

    const emailCheck = await verifyEmail(email);
    if(!emailCheck || emailCheck.deliverability !== 'DELIVERABLE')
    {
        res.status(400)
        throw new Error('Please provide a valid email address')
    }

    const userExists = await User.findOne({email})
    if(userExists)
    {
        res.status(400)
        throw Error('User already exists')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await User.create({name, email, password: hashedPassword})

    if(user)
    {
        const token = generateToken(user._id)

        res.cookie('token', token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000
            }
        )
    }
    else{
        res.status(400)
        throw new Error('Invalid user data')
    }
})

const loginUser = asyncHandler(async (req, res) =>
{
    const {email, password} = req.body
    const user = await User.findOne({email})

    if(user && (await bcrypt.compare(password, user.password)))
    {
        const token = generateToken(user._id)

        res.cookie('token', token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000
            }
        )
        res.json({message: `${user.name} logged in`})
    }
    else{
        res.status(400)
        throw new Error('Invalid data')
    }
})

const getCurrentUser = asyncHandler(async (req, res) =>
{
    const {_id, name, email, elo, gamesPlayed, gamesWon, profilePicture} = await User.findById(req.user.id)
    res.status(200).json({id: _id, name, email, elo, gamesPlayed, gamesWon, profilePicture})
})

const logoutUser = asyncHandler(async (req,res) =>
{
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
        expires: new Date(0)
    })

    res.status(200).json({message:"logout successful"})
})


const generateToken = (userId) =>
{
    return jwt.sign({id: userId}, process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        }
    )
}

module.exports = {registerUser, loginUser, getCurrentUser, logoutUser}    