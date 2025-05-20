const User = require('../models/userModel')

async function updateElo(userId, newElo){
    return await User.findByIdAndUpdate(
        userId,
        {elo: newElo},
        {new: true}
    )
}

async function findById(id){
    return await User.findById(id)
}

module.exports = {updateElo, findById}