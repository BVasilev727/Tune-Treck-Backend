const mongoose = require('mongoose')

const userSchema = mongoose.Schema
(
    {
        name:
        {
            type: String,
            required: [true, 'Name is required']
        },
        email:
        {
            type: String,
            required: [true, 'Email is required']
        },
        password:
        {
            type: String, 
            required: [true, 'Password is required']
        },
        elo:
        {
            type: Number,
            default: 1000
        },
        gamesPlayed:
        {
            type: Number,
            default: 0
        },
        gamesWon:
        {
            type: Number,
            default: 0
        },
        profilePicture:
        {
            type: String,
            default: 'https://res.cloudinary.com/dpx7io883/image/upload/v1746091791/profile_pictures/vttm2v3tpqiiihjnojoi.png'
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('User', userSchema)