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

async function getTopPlayers(limit = 10)
{
    return User.find({},'name elo profilePicture').sort({elo: -1})
    .limit(limit)
    .lean()
    .exec()
}

module.exports = {updateElo, findById, getTopPlayers}